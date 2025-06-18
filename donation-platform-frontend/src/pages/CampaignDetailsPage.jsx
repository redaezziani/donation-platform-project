import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { campaignsAPI, getImageUrl } from "../lib/api";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { CalendarIcon, Users, Target } from "lucide-react";
import { Badge } from "../components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const CampaignDetailsPage = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCampaign = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await campaignsAPI.getCampaign(id);
        setCampaign(data);
      } catch (err) {
        setError("حدث خطأ أثناء جلب تفاصيل الحملة.");
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-pulse text-center">
          <div className="text-xl font-semibold">جاري التحميل...</div>
          <div className="mt-2 text-muted-foreground">
            يرجى الانتظار بينما نجلب تفاصيل الحملة
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <div className="text-xl font-semibold text-destructive">{error}</div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );

  if (!campaign)
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <div className="text-xl font-semibold">
            لا توجد بيانات لهذه الحملة.
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.history.back()}
          >
            العودة للصفحة السابقة
          </Button>
        </div>
      </div>
    );

  // Calculate donation progress percentage
  const progressPercentage = Math.min(
    Math.round((campaign.current_amount / campaign.target_amount) * 100),
    100
  );

  // Format date
  const formattedDate = new Date(campaign.created_at).toLocaleDateString(
    "ar-EG",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className=" relative">
      <div className="w-full  flex max-h-[80vh] overflow-hidden relative">
        <article className="  z-[30] absolute inset-0 p-10 w-full h-full flex flex-col justify-end items-start">
          <h1 className="text-6xl font-AlRaiMediaBold font-bold text-primary mb-4">
            {campaign.title}
          </h1>
          <p className="text-lg text-white/80 max-w-[45rem] mb-4">
           {campaign.description || "لا توجد تفاصيل متاحة لهذه الحملة."}
          </p>
          <div className="flex gap-2">
            <Link to="/about">
            <Button variant={"secondary"}>المزيد عن المنصة</Button>
            </Link>
            <Button variant={"default"}>
              <Link to={`/donate/${campaign.id}`}>تبرع الآن</Link>
            </Button>

          </div>
        </article>
        <img
           src={getImageUrl(campaign.image_path)}
           alt={campaign.title}
          className="w-full h-full saturate-0 object-center"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.pexels.com/photos/5838484/pexels-photo-5838484.jpeg?_gl=1*7xo5ta*_ga*MjAzNjY3NjE3MC4xNzQ5ODQzNjA4*_ga_8JE65Q40S6*czE3NDk4NDg3NTMkbzIkZzEkdDE3NDk4NTA2ODQkajU5JGwwJGgw";
          }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto">
        {/* Campaign Hero */}
        <div className=" flex flex-col gap-2 justify-start items-start overflow-hidden">
       
          <div className="p-6">
            <div className="flex justify-start items-center gap-2 mb-4">
              <span  className="size-2 animate-pulse rounded-full bg-primary">
              </span>
                {campaign.category || "عام"}
            </div>

            {/* Campaign Statistics */}
            <div className="mb-6">
              <div className="mb-2 flex justify-between items-center">
                <span className="text-sm font-medium">التقدم في الحملة</span>
                <span className="text-sm font-bold">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />

              <div className="flex justify-between items-center mt-3">
                <div className="text-lg font-bold">
                  {campaign.current_amount} ر.س
                </div>
                <div className="text-sm text-muted-foreground">
                  من أصل {campaign.target_amount} ر.س
                </div>
              </div>
            </div>

            {/* Meta Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">
                    تاريخ البدء
                  </div>
                  <div className="text-sm font-medium">{formattedDate}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">المتبرعون</div>
                  <div className="text-sm font-medium">
                    {campaign.donors_count || 0} متبرع
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">الهدف</div>
                  <div className="text-sm font-medium">
                    {campaign.target_amount} ر.س
                  </div>
                </div>
              </div>
            </div>

            
            {campaign.markdown_text && (
              <div className="mt-8">
                <div className="prose prose-sm prose-headings:text-primary prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeRaw]}
                  >
                    {campaign.markdown_text}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailsPage;
