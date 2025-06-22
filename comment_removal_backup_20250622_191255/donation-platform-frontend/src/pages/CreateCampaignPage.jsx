import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { campaignsAPI } from "@/lib/api";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

// Form validation schema
const createCampaignSchema = z.object({
  title: z.string()
    .min(3, "يجب أن يكون العنوان 3 أحرف على الأقل")
    .max(255, "لا يمكن أن يتجاوز العنوان 255 حرفًا"),
  description: z.string()
    .min(10, "يجب أن يكون الوصف 10 أحرف على الأقل"),
  markdown_text: z.string().optional(),
  target_amount: z.string()
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, "يجب أن يكون المبلغ المستهدف أكبر من صفر"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  campaign_status: z.string().optional(),
});

const CreateCampaignPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

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

    // Create FormData object for file upload
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    
    if (data.markdown_text) {
      formData.append("markdown_text", data.markdown_text);
    }
    
    formData.append("target_amount", data.target_amount);
    
    if (data.start_date) {
      formData.append("start_date", data.start_date);
    }
    
    if (data.end_date) {
      formData.append("end_date", data.end_date);
    }
    
    formData.append("campaign_status", data.campaign_status || "draft");
    
    // Append file if it exists
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput && fileInput.files[0]) {
      formData.append("image", fileInput.files[0]);
    }

    try {
      const response = await campaignsAPI.createCampaign(formData);
      navigate(`/campaigns/${response.id}`);
    } catch (err) {
      console.error("Error creating campaign:", err);
      setError(
        err.response?.data?.detail || "حدث خطأ أثناء إنشاء الحملة. الرجاء المحاولة مرة أخرى."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mt-14 mx-auto py-2 px-2">

      <Card className="border-none mt-3 w-full max-w-xl">
        <CardContent className=" w-full">
          {error && (
            <div className="p-3 mb-4 text-sm text-white rounded bg-destructive">
              {error}
            </div>
          )}

          <Form
          
          {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className=" flex flex-col gap-4 justify-start items-start w-full"
            >
              <FormField
              
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem
                  
                  >
                    <FormLabel>عنوان الحملة</FormLabel>
                    <FormControl>
                      <Input
                      
                        placeholder="أدخل عنوان الحملة هنا"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      عنوان وصفي يعبر عن هدف الحملة
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
                    <FormLabel>وصف الحملة</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="اكتب وصفاً تفصيلياً للحملة"
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
                    <FormLabel>محتوى إضافي (اختياري)</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="يمكنك إضافة محتوى بتنسيق Markdown هنا (اختياري)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ المستهدف</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="أدخل المبلغ المستهدف"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      المبلغ بالريال السعودي
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ البدء (اختياري)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="date"
                            placeholder="اختر تاريخ البدء"
                            className="pl-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ الانتهاء (اختياري)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="date"
                            placeholder="اختر تاريخ الانتهاء"
                            className="pl-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="campaign_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حالة الحملة</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...field}
                      >
                        <option value="draft">مسودة</option>
                        <option value="active">نشطة</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      يمكنك إنشاء الحملة كمسودة ثم نشرها لاحقاً
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>صورة الحملة (اختياري)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </FormControl>
                <FormDescription>
                  يفضل صورة بأبعاد 16:9 لأفضل عرض
                </FormDescription>
              </FormItem>

              {previewImage && (
                <div className="mt-2">
                  <p className="text-sm mb-2">معاينة الصورة:</p>
                  <img
                    src={previewImage}
                    alt="معاينة"
                    className="max-h-48 rounded border"
                  />
                </div>
              )}

              <div className="flex justify-between gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري إنشاء الحملة..." : "إنشاء الحملة"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(-1)}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCampaignPage;