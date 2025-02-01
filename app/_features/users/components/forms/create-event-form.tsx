"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTransition } from "react";
import { createEvent } from "@/app/_features/users/actions/create-event";
import { useRouter } from "next/navigation";
import { FieldErrors, useForm } from "react-hook-form";
import { formatCurrency } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Check, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CloudUpload, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createEventSchema, modes, uf } from "@/db/schemas";
import { cn } from "@/lib/utils";
import { useGetCategories } from "@/queries/use-get-categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { useGetTicketSectors } from "@/queries/use-get-ticket-sectors";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { LoadingButton } from "@/components/ui/loading-button";
import { CreateUserEventSkeleton } from "@/components/skeletons/create-user-event";

type FormData = z.infer<typeof createEventSchema>;

export const CreateEventForm = () => {
  const { data: categories, isLoading: isCategoriesLoading } =
    useGetCategories();
  const { data: ticketSectors, isLoading: isTicketSectorsLoading } =
    useGetTicketSectors();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [files, setFiles] = useState<File[] | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const form = useForm<FormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: "",
      city: "",
      neighborhood: "",
      address: "",
      uf: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
      categoryId: "",
      mode: "IN_PERSON",
      image: [],
      map: "",
      status: "ACTIVE",
      ticket: {
        sectorId: "",
        price: 0,
        quantity: 0,
        isNominal: false,
        file: undefined,
        obs: "",
      },
    },
  });
  const mode = form.watch("mode");
  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 5,
    multiple: false,
  };

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = async (values: FormData) => {
    console.log("values:", values);
    startTransition(() => {
      createEvent(values)
        .then((res) => {
          if (!res?.success) {
            toast.error(res?.message);
          }

          if (res?.success) {
            toast.success(res?.message);
            router.push("/dashboard//user/events");
          }
        })
        .catch((error) => {
          console.error("Error during user sign-up:", error);
          toast.error("Um erro inesperado aconteceu. Tente novamente.");
        });
    });
  };

  if (isCategoriesLoading || isTicketSectorsLoading) {
    return <CreateUserEventSkeleton />;
  }

  return (
    <div className="w-full">
      {preview && (
        <div className="relative mt-2 w-full h-80 overflow-hidden rounded-lg">
          <Image
            src={preview}
            alt="Preview"
            priority
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
          />
        </div>
      )}
      <Form {...form}>
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
          {/* row 1 */}
          <div className="flex flex-col lgg:flex-row items-center justify-between gap-4">
            <div className="w-full">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {categories ? (
              <div className="w-full" style={{ paddingTop: "12px" }}>
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Categoria</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              disabled={isPending}
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}>
                              {field.value
                                ? categories.find(
                                    (category) => category.id === field.value
                                  )?.name
                                : "Selecione uma categoria"}{" "}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[350px] sm:w-[400px] md:w-[500px] lgg:w-[500px] p-0">
                          <Command>
                            <CommandInput placeholder="Procure uma categoria..." />
                            <CommandList>
                              <CommandEmpty>
                                Nenhuma categoria encontrada
                              </CommandEmpty>
                              <CommandGroup>
                                {categories.map((category) => (
                                  <CommandItem
                                    key={category.id}
                                    onSelect={() =>
                                      field.onChange(category.id)
                                    }>
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        category.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {category.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div>nenhuma categoria cadastrada</div>
            )}
          </div>
          {/* row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <Select
                      disabled={isPending}
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o modelo do evento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modes.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode === "ONLINE" ? "Online" : "Presencial"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Half width on small screens, 1/3 on large screens */}
            <div className="col-span-1 sm:col-span-1 lg:col-span-1">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de início</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        disabled={isPending}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-1 sm:col-span-1 lg:col-span-1">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de encerramento</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        disabled={isPending}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* row 3 */}
          <div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <MinimalTiptapEditor
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full"
                      editorContentClassName="p-5"
                      output="html"
                      placeholder="Insira a descrição do evento aqui..."
                      autofocus={true}
                      editable={true}
                      editorClassName="focus:outline-none"
                      immediatelyRender={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* row 4 */}
          <div className="w-full">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner</FormLabel>
                  <FormControl>
                    <FileUploader
                      value={field.value ?? []}
                      onValueChange={(newFiles: File[] | null) => {
                        if (newFiles && newFiles.length > 0) {
                          const selectedFile = newFiles[0]; // Keep only one file
                          field.onChange([selectedFile]); // Update form state
                          setFiles([selectedFile]); // Update local state for UI
                          setPreview(URL.createObjectURL(newFiles[0])); // Update preview
                        } else {
                          field.onChange(null); // Clear form state if no files
                          setFiles([]); // Clear local state
                        }
                      }}
                      dropzoneOptions={dropZoneConfig}
                      className="relative bg-background rounded-lg p-5">
                      <FileInput
                        id="fileInput"
                        className="outline-dashed outline-1 outline-slate-500">
                        <div className="flex items-center justify-center flex-col p-8 w-full ">
                          <CloudUpload className="text-gray-500 w-10 h-10" />
                          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">
                              Clique para fazer o upload
                            </span>
                            &nbsp; ou arraste e solte um arquivo aqui.
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            SVG, PNG, JPG or GIF
                          </p>
                        </div>
                      </FileInput>
                      <FileUploaderContent>
                        {files &&
                          files.length > 0 &&
                          files.map((file, i) => (
                            <FileUploaderItem key={i} index={i}>
                              <span>{file.name}</span>
                            </FileUploaderItem>
                          ))}
                      </FileUploaderContent>
                    </FileUploader>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* row 5 */}
          {mode === "IN_PERSON" && (
            <div className="flex flex-col lgg:flex-row gap-4 w-full">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="uf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {uf.map((uf) => (
                            <SelectItem key={uf} value={uf}>
                              {uf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          {/* row 6 */}
          <div className="border border-gray-400 rounded-md p-5">
            <h1 className="text-xl">Ingresso</h1>
            <div className="flex flex-col lgg:flex-row mt-5 gap-4">
              <div className="space-y-3 w-full">
                <div className="flex gap-2">
                  <div className="w-full">
                    <FormField
                      control={form.control}
                      name="ticket.price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={formatCurrency(field.value)}
                              placeholder="R$ 0,00"
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
                                const numericValue = rawValue
                                  ? parseInt(rawValue, 10)
                                  : 0;
                                field.onChange(numericValue);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-full">
                    <FormField
                      control={form.control}
                      name="ticket.quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const value = e.target.value
                                  ? parseInt(e.target.value, 10)
                                  : 0;
                                field.onChange(isNaN(value) ? 0 : value);
                              }}
                              className="text-center"
                              type="number"
                              max={999}
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {ticketSectors ? (
                    <div className="w-full" style={{ paddingTop: "12px" }}>
                      <FormField
                        control={form.control}
                        name="ticket.sectorId"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Setor</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    disabled={isPending}
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-[200px] justify-between",
                                      !field.value && "text-muted-foreground"
                                    )}>
                                    {field.value
                                      ? ticketSectors.find(
                                          (sector) => sector.id === field.value
                                        )?.name
                                      : "Selecione um setor"}{" "}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[200px] p-0">
                                <Command>
                                  <CommandInput placeholder="Procure um setor..." />
                                  <CommandList>
                                    <CommandEmpty>
                                      Nenhuma setor encontrado
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {ticketSectors.map((sector) => (
                                        <CommandItem
                                          key={sector.id}
                                          onSelect={() =>
                                            field.onChange(sector.id)
                                          }>
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              sector.id === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {sector.name}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
                    <div>nenhum setor cadastrada</div>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="ticket.file"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Ingresso</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg" // Opcional: restringe tipos de arquivos
                          onChange={(e) =>
                            field.onChange(e.target.files?.[0] || null)
                          } // Atualiza corretamente o arquivo
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="ticket.obs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observação</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Alguma informação adicional?"
                          className="resize-none"
                          {...field}
                          value={field.value ?? ""}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="w-full mt-5">
              <FormField
                control={form.control}
                name="ticket.isNominal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Ingresso Nominal</FormLabel>
                      <FormDescription>
                        Vestibulum in luctus class suspendisse euismod platea
                        lobortis netus
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <LoadingButton
            type="submit"
            label="Criar"
            loadingLabel="Criando"
            disabled={isPending}
            className="w-full"
            isPending={isPending}
          />
        </form>
      </Form>
    </div>
  );
};
