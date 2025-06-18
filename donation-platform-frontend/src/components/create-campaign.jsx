import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../contexts/AuthContext";
import { campaignsAPI } from "../lib/api";
import { useTranslation } from 'react-i18next';
import MDEditor from "@uiw/react-md-editor";
import { Calendar } from "./ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS, fr, es, ru } from "date-fns/locale";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "./ui/sheet";
import { cn } from "../lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { Textarea } from "./ui/textarea"
import UploadImage from "./upload-file";

const CreateCampaignSheet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  const getDateLocale = () => {
    switch (i18n.language) {
      case 'ar': return ar;
      case 'fr': return fr;
      case 'es': return es;
      case 'ru': return ru;
      default: return enUS;
    }
  };

  const createCampaignSchema = z.object({
    title: z
      .string({
        required_error: t('validation.titleRequired'),
        invalid_type_error: t('validation.titleRequired'),
      })
      .min(3, t('validation.titleMinLength'))
      .max(255, t('validation.titleMaxLength'))
      .trim(),
    
    description: z
      .string({
        required_error: t('validation.descriptionRequired'),
        invalid_type_error: t('validation.descriptionRequired'),
      })
      .min(10, t('validation.descriptionMinLength'))
      .max(1000, t('validation.descriptionMaxLength'))
      .trim(),
    
    markdown_text: z
      .string()
      .max(5000, t('validation.contentMaxLength'))
      .optional(),
    
    target_amount: z
      .string({
        required_error: t('validation.targetAmountRequired'),
        invalid_type_error: t('validation.targetAmountRequired'),
      })
      .min(1, t('validation.targetAmountRequired'))
      .refine((val) => !isNaN(Number(val)), {
        message: t('validation.targetAmountInvalid'),
      })
      .refine((val) => Number(val) > 0, {
        message: t('validation.targetAmountPositive'),
      })
      .refine((val) => Number(val) <= 10000000, {
        message: t('validation.targetAmountMax'),
      }),
    
    start_date: z
      .string({
        invalid_type_error: t('validation.startDateInvalid', 'Start date must be a valid date'),
      })
      .optional()
      .refine((date) => {
        if (!date) return true;
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      }, {
        message: t('validation.startDatePast', 'Start date cannot be in the past'),
      }),
    
    end_date: z
      .string({
        invalid_type_error: t('validation.endDateInvalid', 'End date must be a valid date'),
      })
      .optional(),
    
    campaign_status: z
      .string({
        invalid_type_error: t('validation.statusInvalid', 'Campaign status must be text'),
      })
      .optional(),
  }).refine((data) => {
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      return endDate > startDate;
    }
    return true;
  }, {
    message: t('validation.endDateAfterStart', 'End date must be after start date'),
    path: ["end_date"],
  });

  const form = useForm({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      title: "",
      description: "",
      markdown_text: "",
      target_amount: "",
      start_date: "",
      end_date: "",
      campaign_status: "draft",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");
    const formData = new FormData();

    for (const [key, val] of Object.entries(data)) {
      if (val) formData.append(key, val);
    }

    if (uploadedFile) {
      formData.append("image", uploadedFile);
    }

    try {
      const res = await campaignsAPI.createCampaign(formData);
      navigate(`/campaigns/${res.id}`);
    } catch (err) {
      setError(err?.response?.data?.detail || t('messages.errorLoadingData'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (files) => {
    if (files && files.length > 0) {
      setUploadedFile(files[0].file);
    } else {
      setUploadedFile(null);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>{t('navigation.createCampaign')}</Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto w-full min-w-full  md:w-[40rem] md:min-w-[40rem] md:max-w-[90vw] ">
        <SheetHeader className="mt-3">
          <SheetTitle>{t('campaign.create')}</SheetTitle>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 px-2 "
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('campaign.title')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('campaign.title')} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('campaign.titleDescription', 'A descriptive title that expresses the campaign goal')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('campaign.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      className="textarea"
                      placeholder={t('campaign.description')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="markdown_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('campaign.additionalContent')}</FormLabel>
                  <FormControl>
                    <div data-color-mode="light">
                      <MDEditor
                        value={field.value || ""}
                        onChange={(val) => field.onChange(val || "")}
                        preview="edit"
                        hideToolbar={false}
                        height={200}
                        textareaProps={{
                          placeholder: t('campaign.markdownPlaceholder', 
                            "Write additional content using Markdown...\n\n# Main Title\n## Subtitle\n- List\n- Items\n\n**Bold text** and *italic text*"
                          ),
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    {t('campaign.markdownSupport')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className=" flex w-full justify-between items-start gap-4">
              <FormField
                control={form.control}
                name="target_amount"
                render={({ field }) => (
                  <FormItem
                  className={"w-full"}
                  >
                    <FormLabel>{t('campaign.targetAmount')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10000"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t('common.sar')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="campaign_status"
                render={({ field }) => (
                  <FormItem
                  className={"w-full"}
                  >
                    <FormLabel>{t('campaign.campaignStatus')}</FormLabel>
                    <Select
                    className={"w-full"}
                    value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger
                        className={"w-full"}
                        >
                          <SelectValue placeholder={t('campaign.campaignStatus')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">{t('campaign.draft')}</SelectItem>
                        <SelectItem value="active">{t('campaign.active')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('campaign.startDate')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: getDateLocale() })
                            ) : (
                              <span>{t('campaign.selectStartDate', 'Select start date')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(date?.toISOString().split("T")[0])
                          }
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      {t('campaign.startDateDescription', 'Campaign start date (cannot be in the past)')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('campaign.endDate')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: getDateLocale() })
                            ) : (
                              <span>{t('campaign.selectEndDate', 'Select end date')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(date?.toISOString().split("T")[0])
                          }
                          disabled={(date) => {
                            const today = new Date(
                              new Date().setHours(0, 0, 0, 0)
                            );
                            const startDate = form.getValues("start_date")
                              ? new Date(form.getValues("start_date"))
                              : today;
                            return date < startDate;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      {t('campaign.endDateDescription', 'Campaign end date (must be after start date)')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>{t('campaign.campaignImage')}</FormLabel>
              <FormControl>
                <UploadImage onFileChange={handleFileChange} />
              </FormControl>
              <FormDescription>
                {t('campaign.imageDescription', '16:9 aspect ratio is ideal for display')}
              </FormDescription>
            </FormItem>

            <SheetFooter className="mt-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('campaign.creating') : t('campaign.create')}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateCampaignSheet;
