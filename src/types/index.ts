export enum Role {
  CUSTOMER = 'CUSTOMER',
  BARBER = 'BARBER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum RatedType {
  USER = 'USER',
  BARBER = 'BARBER',
  BARBERSHOP = 'BARBERSHOP',
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bookings: Booking[];
  ratingsGiven: Rating[];
  favorites: Favorite[];
  ownedBarberShops: BarberShop[];
}

export interface Barber {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  experienceYears?: number;
  specialties?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  barberShops: BarberShop[];
  bookings: Booking[];
  services: ManagementService[];
  workingHours: WorkingHours[];
  ratingsGiven: Rating[];
  averageRating?: number;
  totalRatings?: number;
}

export interface BarberShop {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  avatar?: string;
  coverPhoto?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  barbers: Barber[];
  services: ManagementService[];
  workingHours: WorkingHours[];
  favorites: Favorite[];
  averageRating?: number;
  totalRatings?: number;
  favoriteCount?: number;
}

export interface ManagementService {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  barberShop: BarberShop;
  category: Category;
  barber?: Barber;
  bookings: Booking[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  services: ManagementService[];
}

export interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  totalPrice: number;
  notes?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  barber: Barber;
  barberShop: BarberShop;
  managementService: ManagementService;
  ratings: Rating[];
}

export interface Rating {
  id: string;
  rating: number;
  comment?: string;
  ratedId: string;
  ratedType: RatedType;
  createdAt: string;
  updatedAt: string;
  rater?: User;
  barberRater?: Barber;
  booking?: Booking;
}

export interface Favorite {
  id: string;
  createdAt: string;
  user: User;
  barberShop: BarberShop;
}

export interface WorkingHours {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
  ownerId: string;
  ownerType: string;
  createdAt: string;
  updatedAt: string;
  barber?: Barber;
  barberShop?: BarberShop;
}

export interface AuthPayload {
  token: string;
  refreshToken: string;
  user?: User;
  barber?: Barber;
  expiresIn: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
}

export interface CreateBookingInput {
  userId: string;
  barberId: string;
  barberShopId: string;
  managementServiceId: string;
  startTime: string;
  notes?: string;
}

export interface SelectedService {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  category: {
    id: string;
    name: string;
  };
}

export interface BookingCart {
  services: SelectedService[];
  totalPrice: number;
  totalDuration: number;
  barberId?: string;
  barberShopId: string;
}

export interface CreateRatingInput {
  userId: string;
  entityId: string;
  entityType: RatedType;
  rating: number;
  comment?: string;
  bookingId?: string;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    oneStar: number;
    twoStar: number;
    threeStar: number;
    fourStar: number;
    fiveStar: number;
  };
}