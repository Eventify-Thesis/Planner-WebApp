// @ts-nocheck 
// @ts-ignore 
export enum TimeFilters {
  ANY = 'ANY',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

export enum TypeFilters {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  TEMPORARY = 'TEMPORARY',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  VOLUNTEER = 'VOLUNTEER',
  OTHER = 'OTHER',
}

export enum ExperienceLevelFilters {
  INTERNSHIP = 'INTERNSHIP',
  ENTRY_LEVEL = 'ENTRY_LEVEL',
  ASSOCIATE = 'ASSOCIATE',
  MID_SENIOR = 'MID_SENIOR',
  DIRECTOR = 'DIRECTOR',
  EXECUTIVE = 'EXECUTIVE',
}

export enum WorkingModeFilters {
  ON_SITE = 'ON_SITE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
}

export enum IndustryFilters {
  ACCOMMODATION_SERVICES = 'ACCOMMODATION_SERVICES',
  ADMINISTRATIVE_AND_SUPPOR_SERVICES = 'ADMINISTRATIVE_AND_SUPPOR_SERVICES',
  CONSTRUCTION = 'CONSTRUCTION',
  CONSUMER_SERVICES = 'CONSUMER_SERVICES',
  EDUCATION = 'EDUCATION',
  ENTERTAINMENT_PROVIDERS = 'ENTERTAINMENT_PROVIDERS',
  FARMING_RANCHING_FORESTRY = 'FARMING_RANCHING_FORESTRY',
  FINANCIAL_SERVICES = 'FINANCIAL_SERVICES',
  GOVERNMENT_ADMINISTRATION = 'GOVERNMENT_ADMINISTRATION',
  HOSPITALS_AND_HEALTH_CARE = 'HOSPITALS_AND_HEALTH_CARE',
  MANUFACTURING = 'MANUFACTURING',
  PROFESSIONAL_SERVICES = 'PROFESSIONAL_SERVICES',
  REAL_ESTATE_AND_EQUIPMENT_RENTAL_SERVICES = 'REAL_ESTATE_AND_EQUIPMENT_RENTAL_SERVICES',
  RETAIL = 'RETAIL',
  TECHNOLOGY_INFORMATION_AND_MEDIA = 'TECHNOLOGY_INFORMATION_AND_MEDIA',
}

export enum LocationFilters {
  Ha_Noi = '1',
  Ho_Chi_Minh = '2',
  Binh_Duong = '3',
  Bac_Ninh = '4',
  Dong_Nai = '5',
  Hung_Yen = '6',
  Hai_Duong = '7',
  Da_Nang = '8',
  Hai_Phong = '9',
  An_Giang = '10',
  Ba_Ria_Vung_Tau = '11',
  Bac_Giang = '12',
  Bac_Kan = '13',
  Bac_Lieu = '14',
  Ben_Tre = '15',
  Binh_Dinh = '16',
  Binh_Phuoc = '17',
  Binh_Thuan = '18',
  Ca_Mau = '19',
  Can_Tho = '20',
  Cao_Bang = '21',
  Cuu_Long = '22',
  Dak_Lak = '23',
  Dak_Nong = '24',
  Dien_Bien = '25',
  Dong_Thap = '26',
  Gia_Lai = '27',
  Ha_Giang = '28',
  Ha_Nam = '29',
  Ha_Tinh = '30',
  Hau_Giang = '31',
  Hoa_Binh = '32',
  Khanh_Hoa = '33',
  Kien_Giang = '34',
  Kon_Tum = '35',
  Lai_Chau = '36',
  Lam_Dong = '37',
  Lang_Son = '38',
  Lao_Cai = '39',
  Long_An = '40',
  Nam_Dinh = '44',
  Nghe_An = '45',
  Ninh_Binh = '46',
  Ninh_Thuan = '47',
  Phu_Tho = '48',
  Phu_Yen = '49',
  Quang_Binh = '50',
  Quang_Nam = '51',
  Quang_Ngai = '52',
  Quang_Ninh = '53',
  Quang_Tri = '54',
  Soc_Trang = '55',
  Son_La = '56',
  Tay_Ninh = '57',
  Thai_Binh = '58',
  Thai_Nguyen = '59',
  Thanh_Hoa = '60',
  Thua_Thien_Hue = '61',
  Tien_Giang = '62',
  Toan_Quoc = '63',
  Tra_Vinh = '64',
  Tuyen_Quang = '65',
  Vinh_Long = '66',
  Vinh_Phuc = '67',
  Yen_Bai = '68',
}
export const experienceLevelsFilter = Object.keys(ExperienceLevelFilters).filter((item) => {
  return isNaN(Number(item));
});

export const workingModesFilter = Object.keys(WorkingModeFilters).filter((item) => {
  return isNaN(Number(item));
});

export const industriesFilter = Object.keys(IndustryFilters).filter((item) => {
  return isNaN(Number(item));
});

export const typesFilter = Object.keys(TypeFilters).filter((item) => {
  return isNaN(Number(item));
});

export const timeFilter = Object.keys(TimeFilters).filter((item) => {
  return isNaN(Number(item));
});

export const workingModeFilter = Object.keys(WorkingModeFilters).filter((item) => {
  return isNaN(Number(item));
});

export const locationFilter = Object.keys(LocationFilters).filter((item) => {
  return isNaN(Number(item));
});

export const filter = {
  workingModeFilter,
  timeFilter,
  industriesFilter,
  typesFilter,
  experienceLevelsFilter,
  workingModesFilter,
  locationFilter,
};
