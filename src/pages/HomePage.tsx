import React, { useEffect, useState } from 'react';
import { Banner } from '@/components/home/Banner/Banner';
import { CategorySection } from '@/components/home/CategorySection/CategorySection';
import { EventCardGrid } from '@/components/home/EventCardGrid/EventCardGrid';
import { useTranslation } from 'react-i18next';
import { useResponsive } from '@/hooks/useResponsive';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';

const categories = [
  { name: "entertainment"},
  { name: "education" },
  { name: "cultural" },
  { name: "sport" },
  { name: "technology" },
  { name: "travel" },
];
const images = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxBjQ6cacjUhWGAxXt_j-UgOdQhDAo3ce9Eg&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgrIRhLAtatO1uBu28Gf98B84CqDnZC5SUrA&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgrIRhLAtatO1uBu28Gf98B84CqDnZC5SUrA&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxBjQ6cacjUhWGAxXt_j-UgOdQhDAo3ce9Eg&s",
];
const eventInfo = {
  eventCategory: "Upcoming Events", events: [
    {
      title: "The Road to Jobs and Internships: Starting with LinkedIn",
      date: { month: "JAN", day: "13" }, // ✅ Correct type
      time: "6 PM - 7:30 PM",
      category: "Educational & Business",
      price: "INR 49",
      interestedCount: 21,
      venue: "Online",
      image: "https://salt.tkbcdn.com/ts/ds/44/e2/90/76fb84dbfdcd86e99f720aca467ffd04.png",
    },
    {
      title: "Online Zumba Dance Fitness Class over Zoom",
      date: { month: "NOV", day: "29" }, // ✅ Correct type
      time: "7 PM - 8 PM",
      category: "Sports & Fitness",
      price: "CAD 7",
      interestedCount: 10,
      venue: "Zoom",
      image: "https://salt.tkbcdn.com/ts/ds/44/e2/90/76fb84dbfdcd86e99f720aca467ffd04.png",
    },
    {
      title: "Easy Book Folding: Christmas Edition",
      date: { month: "DEC", day: "12" }, // ✅ Correct type
      time: "4 PM - 5:30 PM",
      category: "Cultural & Arts",
      price: "FREE",
      interestedCount: 10,
      venue: "Community Library",
      image: "https://salt.tkbcdn.com/ts/ds/44/e2/90/76fb84dbfdcd86e99f720aca467ffd04.png",
    },
  ]
};


const HomePage: React.FC = () => {
  
  const { isTablet, isDesktop } = useResponsive();

  const { t } = useTranslation();

  const newCategory = categories.map(category => ({
    name: (t('homePage.' + category.name)),
    imageUrl: 'https://www.mancecreative.com/wp-content/uploads/2022/05/Integra-conf-logo.jpg'
  }));
  const desktopLayout = (
    <>
      <div>
        <Banner images={images} />
      </div>
      <CategorySection categories={newCategory} />
      <EventCardGrid eventCategory={eventInfo.eventCategory} events={eventInfo.events} />
    </>
  );
  
  const mobileAndTabletLayout = <>
      <div>
        <Banner images={images} />
      </div>
      <EventCardGrid eventCategory={eventInfo.eventCategory} events={eventInfo.events} />
  </>;
  
  return (
    <>
      <PageTitle>{t('homePage.title')}</PageTitle>
      {isDesktop ? desktopLayout : mobileAndTabletLayout}
    </>
  );
};

export default HomePage;
