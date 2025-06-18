import React from 'react'
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { Card, CardContent, CardTitle } from "../../components/ui/card";
import { getImageUrl } from "../../lib/api";

const ArticalCard = ({ campaign }) => {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  return (
    <Card
      key={campaign.id}
      className="h-full border-none flex flex-col justify-between"
    >
      <CardContent className="p-0 flex flex-col md:flex-row gap-2 justify-start items-start h-full">
        {campaign.image_path && (
          <div className="h-72  w-full max-w-96 overflow-hidden">
            <img
              src={getImageUrl(campaign.image_path)}
              alt={campaign.title}
              className="w-full h-full saturate-0 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://images.pexels.com/photos/5838484/pexels-photo-5838484.jpeg?_gl=1*7xo5ta*_ga*MjAzNjY3NjE3MC4xNzQ5ODQzNjA4*_ga_8JE65Q40S6*czE3NDk4NDg3NTMkbzIkZzEkdDE3NDk4NTA2ODQkajU5JGwwJGgw";
              }}
            />
          </div>
        )}
        <div className="w-full  flex md:flex-row flex-col gap-2 justify-between items-start">
          <div className="  max-w-[33rem]  gap-1 flex flex-col flex-grow">
            <CardTitle className=" text-base font-bold">
              {campaign.title}
            </CardTitle>
            <p className="  text-sm line-clamp-4 md:line-clamp-none text-muted-foreground flex-grow">
              {campaign.description}
            </p>
            <div className=" text-sm">
              {t('campaign.currentAmount')}: {formatCurrency(campaign.current_amount)} /{" "}
              {formatCurrency(campaign.target_amount)}
            </div>
          </div>
          <Link
            to={`/campaigns/${campaign.id}`}
            className="text-primary hover:underline "
          >
            {t('campaign.viewDetails')}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default ArticalCard