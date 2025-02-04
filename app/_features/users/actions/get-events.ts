type EventStatus = "ACTIVE" | "INACTIVE" | "ENDED";
type EventMode = "ONLINE" | "IN_PERSON";
type TicketStatus = "AVAILABLE" | "SOLD" | "CANCELLED";

type Event = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  image: string;
  status: EventStatus;
  mode: EventMode;
  city: string;
  neighborhood: string;
  address: string;
  uf: string;
  date: string;
  map: string | null;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
};

type Ticket = {
  id: string;
  eventId: string;
  batchId: string | null;
  buyerId: string | null;
  price: number;
  isNominal: boolean;
  status: TicketStatus;
  purchaseDate: string | null; // ISO date string
  quantity: number;
  sectorId: string;
  obs: string;
  qrCode: string | null;
  file: string;
  createdAt: string; // ISO date string
};

type EventData = {
  events: Event;
  tickets: Ticket;
};

const URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/events/user`;

export const getEvents = async (id: string): Promise<EventData[]> => {
  try {
    const res = await fetch(`${URL}/${id}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch events`);
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};
