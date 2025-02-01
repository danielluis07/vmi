"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { events, tickets } from "@/db/schema";
import { createEventSchema } from "@/db/schemas";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export const createEvent = async (
  values: z.infer<typeof createEventSchema>
) => {
  try {
    const session = await auth();
    const validatedValues = createEventSchema.safeParse(values);
    const generateFileName = (bytes = 32) =>
      crypto.randomBytes(bytes).toString("hex");

    if (!session || !session.user.id) {
      return { success: false, message: "Not authenticated" };
    }

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const {
      name,
      image,
      categoryId,
      description,
      map,
      address,
      city,
      neighborhood,
      uf,
      mode,
      startDate,
      ticket,
      endDate,
    } = validatedValues.data;

    if (
      !name ||
      !categoryId ||
      !startDate ||
      !endDate ||
      !image ||
      !description ||
      !ticket ||
      !mode
    ) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    /* Image Upload */

    const imageFile = image[0];
    const ticketFile = ticket.file;

    if (!imageFile || !ticketFile) {
      return {
        success: false,
        message: "Arquivo de imagem ou ingresso não encontrado",
      };
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hash = crypto.createHash("sha256");
    hash.update(buffer);
    const hashHex = hash.digest("hex");

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: generateFileName(),
      ContentType: imageFile.type,
      ContentLength: imageFile.size,
      ChecksumSHA256: hashHex,
      Metadata: {
        userId: session?.user.id,
      },
    });

    const signedURL = await getSignedUrl(s3, putObjectCommand, {
      expiresIn: 3600,
    });

    if (!signedURL) {
      return {
        success: false,
        message: "Falha ao criar a URL de upload",
      };
    }

    const res = await fetch(signedURL, {
      method: "PUT",
      body: imageFile,
      headers: {
        "Content-Type": imageFile.type,
      },
    });

    if (!res.ok) {
      return {
        success: false,
        message: "Falha ao realizar o upload da imagem",
      };
    }

    /* Ticket file upload */

    const ticketBuffer = Buffer.from(await ticketFile.arrayBuffer());
    const ticketHash = crypto
      .createHash("sha256")
      .update(ticketBuffer)
      .digest("hex");

    const ticketKey = generateFileName();

    const putTicketCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: ticketKey,
      ContentType: ticketFile.type,
      ContentLength: ticketFile.size,
      ChecksumSHA256: ticketHash,
      Metadata: { userId: session?.user.id },
    });

    const signedTicketURL = await getSignedUrl(s3, putTicketCommand, {
      expiresIn: 3600,
    });

    if (!signedTicketURL) {
      return {
        success: false,
        message: "Falha ao criar a URL de upload do ingresso",
      };
    }

    const uploadTicketResponse = await fetch(signedTicketURL, {
      method: "PUT",
      body: ticketFile,
      headers: { "Content-Type": ticketFile.type },
    });

    if (!uploadTicketResponse.ok) {
      return {
        success: false,
        message: "Falha ao realizar o upload do ingresso",
      };
    }

    const [event] = await db
      .insert(events)
      .values({
        name,
        image: signedURL.split("?")[0],
        categoryId,
        organizerId: session.user.id,
        endDate,
        address: address || null,
        city: city || null,
        neighborhood: neighborhood || null,
        uf: uf || null,
        startDate,
        description,
        status: "ACTIVE",
        map: map || null,
        mode,
      })
      .returning({ id: events.id });

    if (!event) {
      return {
        success: false,
        message: "Falha ao criar o evento",
      };
    }

    const eventTicket = await db.insert(tickets).values({
      eventId: event.id,
      file: signedTicketURL.split("?")[0],
      status: "AVAILABLE",
      price: ticket.price,
      quantity: ticket.quantity,
      isNominal: ticket.isNominal,
      obs: ticket.obs,
      sectorId: ticket.sectorId,
    });

    if (!eventTicket) {
      return {
        success: false,
        message: "Falha ao criar o ingresso",
      };
    }

    revalidatePath("/dashboard/user/events");
    return { success: true, message: "Evento criado com sucesso" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao criar o evento",
    };
  }
};
