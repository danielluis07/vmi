"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTransition } from "react";
import { createEvent } from "@/app/_features/users/actions/create-event";
import { useRouter } from "next/navigation";
import {
  FieldErrors,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
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
import {
  ArrowBigLeft,
  ArrowBigRight,
  Check,
  ChevronsUpDown,
  Plus,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CloudUpload, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createProducerEventSchema, modes, uf } from "@/db/schemas";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";
import { Separator } from "@/components/ui/separator";
import { ClockLoader } from "react-spinners";

enum STEPS {
  FIRST = 0,
  SECOND = 1,
  THIRD = 2,
  FOURTH = 3,
  FIFTH = 4,
  SIXTH = 5,
}

type FormData = z.infer<typeof createProducerEventSchema>;

export const CreateEventForm = () => {
  const [step, setStep] = useState<STEPS>(STEPS.FIRST);
  const [files, setFiles] = useState<File[] | null>(null);
  // const [preview, setPreview] = useState<string | null>(null);
  const { data, isLoading } = useGetTicketSectors();
  const { data: categories, isLoading: isCategoriesLoading } =
    useGetCategories();
  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 5,
    multiple: false,
  };

  const form = useForm<FormData>({
    resolver: zodResolver(createProducerEventSchema),
    defaultValues: {
      name: "",
      city: "",
      neighborhood: "",
      address: "",
      uf: "",
      description: "",
      startDate: "",
      endDate: "",
      categoryId: "",
      mode: "IN_PERSON",
      image: [],
      map: "",
      status: "ACTIVE",
      days: [
        {
          date: "",
          startTime: "",
          endTime: "",
          batches: [
            {
              name: "",
              startDate: "",
              endDate: "",
              tickets: [
                {
                  sectorId: "",
                  price: 0,
                  quantity: 0,
                  gender: "MALE",
                  file: undefined,
                  obs: "",
                },
              ],
            },
          ],
        },
      ],
    },
  });

  const evetMode = form.watch("mode");

  const handlePreviousStep = () => {
    setStep((prev) => {
      if (prev === STEPS.THIRD && evetMode === "ONLINE") {
        return STEPS.FIRST; // Skip SECOND when going back
      }
      return prev > STEPS.FIRST ? prev - 1 : prev;
    });
  };

  const handleNextStep = () => {
    setStep((prev) => {
      if (prev === STEPS.FIRST && evetMode === "ONLINE") {
        return STEPS.THIRD; // Skip SECOND when going forward
      }
      return prev < STEPS.SIXTH ? prev + 1 : prev;
    });
  };

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = async (values: FormData) => {
    console.log(values);
  };

  const { control } = form;

  const {
    fields: days,
    append: addDay,
    remove: removeDay,
  } = useFieldArray({
    control,
    name: "days",
  });

  if (isLoading || isCategoriesLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <ClockLoader />
      </div>
    );
  }

  if (!categories) {
    return (
      <div>Você precisa adicionar categorias antes de criar um evento</div>
    );
  }

  return (
    <Form {...form}>
      <form
        className="relative w-full h-[400px] flex items-center justify-between gap-3 my-10"
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        {/* col 1 */}
        <div>
          {step !== STEPS.FIRST && (
            <div
              className="border border-black p-3 rounded-full cursor-pointer"
              onClick={handlePreviousStep}>
              <ArrowBigLeft />
            </div>
          )}
        </div>
        {/* col 2 */}
        <div className="w-full overflow-x-hidden max-h-[450px]">
          {step === STEPS.FIRST && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    Primeiro, defina o título, o modelo e a categoria do evento
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="mode"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o modelo do evento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="IN_PERSON">
                                Presencial
                              </SelectItem>
                              <SelectItem value="ONLINE">Online</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}>
                                  {field.value
                                    ? categories.find(
                                        (category) =>
                                          category.id === field.value
                                      )?.name
                                    : "Selecione uma categoria"}{" "}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[250px] p-0">
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
                </CardContent>
              </Card>
            </motion.div>
          )}
          {step === STEPS.SECOND && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Qual é o endereço do evento?</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col lgg:flex-row gap-4">
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
                  <div className="flex-1">
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
                  </div>
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
                </CardContent>
              </Card>
            </motion.div>
          )}
          {step === STEPS.THIRD && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Qual é a descrição do evento?</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
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
                </CardContent>
              </Card>
            </motion.div>
          )}
          {step === STEPS.FOURTH && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Escolha o banner do evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FileUploader
                            value={field.value ?? []}
                            onValueChange={(newFiles: File[] | null) => {
                              if (newFiles && newFiles.length > 0) {
                                const selectedFile = newFiles[0];
                                field.onChange([selectedFile]);
                                setFiles([selectedFile]);
                                // setPreview(URL.createObjectURL(newFiles[0]));
                              } else {
                                field.onChange(null);
                                setFiles([]);
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
                </CardContent>
              </Card>
            </motion.div>
          )}
          {step === STEPS.FIFTH && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}>
              <Card className="p-5">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() =>
                      addDay({
                        date: "",
                        startTime: "",
                        endTime: "",
                        batches: [
                          {
                            name: "",
                            startDate: "",
                            endDate: "",
                            tickets: [
                              {
                                sectorId: "",
                                price: 0,
                                quantity: 0,
                                gender: "MALE",
                                file: undefined,
                                obs: "",
                              },
                            ],
                          },
                        ],
                      })
                    }>
                    Adicionar Dia
                    <Plus />
                  </Button>
                </div>

                {days.map((day, dayIndex) => (
                  <div key={day.id} className="mb-4 mt-5">
                    <Separator className="my-5" />
                    <h1 className="text-2xl font-bold mb-5">
                      Dia {dayIndex + 1}
                    </h1>
                    <FormField
                      control={control}
                      name={`days.${dayIndex}.date`}
                      render={({ field }) => (
                        <FormItem className="w-[250px]">
                          <FormLabel>Data</FormLabel>
                          <FormControl>
                            <DateTimePicker
                              granularity="day"
                              value={field.value || undefined}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Manage Batches inside each Day */}
                    <BatchesFieldArray
                      control={control}
                      dayIndex={dayIndex}
                      data={data}
                    />

                    {days.length > 1 && (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeDay(dayIndex)}>
                          Remover Dia {dayIndex + 1}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </Card>
            </motion.div>
          )}
          {step === STEPS.SIXTH && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}>
              <Card className="flex justify-center items-center">
                <p>página de resumo e botão de confirmar</p>
              </Card>
            </motion.div>
          )}
        </div>
        {/* col 3 */}
        <div>
          {step !== STEPS.SIXTH && (
            <div
              className="border border-black p-3 rounded-full cursor-pointer"
              onClick={handleNextStep}>
              <ArrowBigRight />
            </div>
          )}
        </div>
        {/* <Button type="submit">Submit</Button> */}
      </form>
    </Form>
  );
};

// Component for Managing Batches Inside Each Day
const BatchesFieldArray = ({
  control,
  dayIndex,
  data,
}: {
  control: any;
  dayIndex: number;
  data:
    | {
        id: string;
        name: string;
        createdAt: string | null;
        updatedAt: string | null;
      }[]
    | undefined;
}) => {
  const {
    fields: batches,
    append: addBatch,
    remove: removeBatch,
  } = useFieldArray({
    control,
    name: `days.${dayIndex}.batches`,
  });

  const { getValues } = useFormContext(); // <-- Get form values to access endDate dynamically

  return (
    <div>
      <h1 className="text-lg font-bold mt-5">Lotes</h1>
      {batches.map((batch, batchIndex) => (
        <div key={batch.id} className="border p-4 rounded mb-4 mt-2 relative">
          <FormField
            control={control}
            name={`days.${dayIndex}.batches.${batchIndex}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lote {batchIndex + 1}</FormLabel>
                <FormControl>
                  <Input {...field} className="w-[250px]" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`days.${dayIndex}.batches.${batchIndex}.startDate`}
            render={({ field }) => (
              <FormItem className="w-[250px]">
                <FormLabel>Data de início</FormLabel>
                <FormControl>
                  <DateTimePicker
                    granularity="minute"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`days.${dayIndex}.batches.${batchIndex}.endDate`}
            render={({ field }) => (
              <FormItem className="w-[250px]">
                <FormLabel>Data de encerramento</FormLabel>
                <FormControl>
                  <DateTimePicker
                    granularity="minute"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Manage Tickets inside each Batch */}
          <TicketsFieldArray
            control={control}
            dayIndex={dayIndex}
            batchIndex={batchIndex}
            data={data}
          />

          {batches.length > 1 && (
            <Button
              className="absolute top-1 right-1"
              type="button"
              variant="destructive"
              onClick={() => removeBatch(batchIndex)}>
              Remover Lote
            </Button>
          )}
        </div>
      ))}

      <Button
        type="button"
        onClick={() => {
          const previousEndDate = getValues(
            `days.${dayIndex}.batches.${batches.length - 1}.endDate`
          );
          addBatch({
            name: "",
            startDate: previousEndDate || "", // Now properly accessing endDate from the form state
            endDate: "",
            tickets: [
              {
                sectorId: "",
                price: 0,
                quantity: 0,
                gender: "MALE",
                file: undefined,
                obs: "",
              },
            ],
          });
        }}>
        Adicionar Lote
      </Button>
    </div>
  );
};

// Component for Managing Tickets Inside Each Batch
const TicketsFieldArray = ({
  control,
  dayIndex,
  batchIndex,
  data,
}: {
  control: any;
  dayIndex: number;
  batchIndex: number;
  data:
    | {
        id: string;
        name: string;
        createdAt: string | null;
        updatedAt: string | null;
      }[]
    | undefined;
}) => {
  const {
    fields: tickets,
    append: addTicket,
    remove: removeTicket,
  } = useFieldArray({
    control,
    name: `days.${dayIndex}.batches.${batchIndex}.tickets`,
  });

  const { getValues } = useFormContext();

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-lg my-5">Ingressos</h2>
        <Button
          type="button"
          onClick={() => {
            // get previous ticket quantity
            const previousQuantity = getValues(
              `days.${dayIndex}.batches.${batchIndex}.tickets.${
                tickets.length - 1
              }.quantity`
            );

            // get previous ticket sectorId
            const previousSectorId = getValues(
              `days.${dayIndex}.batches.${batchIndex}.tickets.${
                tickets.length - 1
              }.sectorId`
            );

            // get previous ticket gender
            const previousGender = getValues(
              `days.${dayIndex}.batches.${batchIndex}.tickets.${
                tickets.length - 1
              }.gender`
            );

            addTicket({
              sectorId: previousSectorId || "",
              price: 0,
              gender: previousGender,
              quantity: previousQuantity || 0,
              isNominal: false,
              file: undefined,
              obs: "",
            });
          }}>
          Adicionar Ingresso
          <Plus />
        </Button>
      </div>
      {tickets.map((ticket, ticketIndex) => (
        <div
          key={ticket.id}
          className="relative grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_auto] gap-4 items-start mt-8 border rounded-md p-3">
          <div className="flex flex-col space-y-4 pt-3">
            {data && (
              <FormField
                control={control}
                name={`days.${dayIndex}.batches.${batchIndex}.tickets.${ticketIndex}.sectorId`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Setor</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}>
                            {field.value
                              ? data.find((sector) => sector.id === field.value)
                                  ?.name
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
                              {data.map((sector) => (
                                <CommandItem
                                  key={sector.id}
                                  onSelect={() => field.onChange(sector.id)}>
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
            )}

            <FormField
              control={control}
              name={`days.${dayIndex}.batches.${batchIndex}.tickets.${ticketIndex}.price`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={formatCurrency(field.value)}
                      placeholder="R$ 0,00"
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        const numericValue = rawValue
                          ? parseInt(rawValue, 10)
                          : 0;
                        field.onChange(numericValue);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col space-y-4">
            <FormField
              control={control}
              name={`days.${dayIndex}.batches.${batchIndex}.tickets.${ticketIndex}.quantity`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="text-center"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseInt(e.target.value, 10)
                          : 0;
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                      max={999}
                      min={0}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`days.${dayIndex}.batches.${batchIndex}.tickets.${ticketIndex}.gender`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gênero</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Masculino</SelectItem>
                        <SelectItem value="FEMALE">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col md:col-span-1 w-full">
            <FormField
              control={control}
              name={`days.${dayIndex}.batches.${batchIndex}.tickets.${ticketIndex}.obs`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obs</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={5} className="w-full" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {tickets.length > 1 && (
            <div className="md:flex md:items-center md:justify-center mt-3 md:mt-6">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="maxmd:flex maxmd:justify-center maxmd:w-full"
                onClick={() => removeTicket(ticketIndex)}
                disabled={tickets.length === 1}>
                <Trash2 className="size-5" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
