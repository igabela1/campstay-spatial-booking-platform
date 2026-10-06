import Link from 'next/link';
import { ArrowRight, MapPinned, Tent, Caravan, House, Waves } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AccommodationCard } from '@/components/accommodation-card';
import { prisma } from '@/lib/prisma';

const testimonials = [
  {
    name: 'Amina',
    role: 'Guest',
    avatar: '',
    comment:
      'Beautiful location by the lake, very peaceful and clean. The campsite was easy to find and reserve.',
  },
  {
    name: 'Faris',
    role: 'Camper Visitor',
    avatar: '',
    comment:
      'We stayed with a camper van and had everything we needed: electricity, water, showers and Wi-Fi.',
  },
  {
    name: 'Lejla',
    role: 'Family Guest',
    avatar: '',
    comment:
      'The bungalow and pool cottage offer was excellent for families. We would definitely come again.',
  },
];

const accommodationTypes = [
  {
    title: 'Tent Pitches',
    description: 'Spacious places for tents in a natural lakeside setting.',
    icon: Tent,
  },
  {
    title: 'Camper Pitches',
    description: 'Places for campers and caravans with essential camp infrastructure.',
    icon: Caravan,
  },
  {
    title: 'Bungalows & Apartments',
    description: 'Comfortable accommodation units for couples, families and groups.',
    icon: House,
  },
  {
    title: 'Pool Cottage',
    description: 'Private house with additional comfort for longer stays and family visits.',
    icon: Waves,
  },
];

export default async function Home() {
  const listings = await prisma.listing.findMany({
    where: {
      status: 'APPROVED',
    },
    include: {
      photos: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 6,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative w-full overflow-hidden bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 py-20 md:py-32 lg:py-40">
          <div className="container relative z-10 mx-auto px-4 text-center text-white">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Auto Kamp Miris Ljeta
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg text-white/90 md:text-xl">
              Digital platform for discovering and booking camping places, bungalows, apartments
              and small tourist accommodation with location-based insight near Jablanicko Lake.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/search">
                  Explore Accommodation <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild size="lg" variant="secondary">
                <Link href="/map">
                  Open Interactive Map <MapPinned className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full bg-background py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Accommodation Types
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
                The platform supports different categories of tourist accommodation adapted to
                camping and small-scale hospitality.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {accommodationTypes.map((item) => {
                const Icon = item.icon;

                return (
                  <Card key={item.title} className="h-full">
                    <CardHeader>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle>{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="features" className="w-full bg-muted/30 py-12 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Featured Accommodation
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
                Explore approved accommodation units currently visible on the platform.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.length > 0 ? (
                listings.map((listing) => {
                  const coverPhoto =
                    listing.photos.find((photo) => photo.isCover)?.url ||
                    listing.photos[0]?.url ||
                    '/logo.jpg';
return (
  <AccommodationCard
    key={listing.id}
    listing={{
      id: listing.id,
      title: listing.title,
      location: `${listing.city}, ${listing.address}`,
      price: listing.price,
      imageUrl: coverPhoto,
      imageHint: "camp lake accommodation",

      spatialZone: listing.spatialZone,
      distanceToToilet: listing.distanceToToilet,
      distanceToBeach: listing.distanceToBeach,
      shadeLevel: listing.shadeLevel,
      noiseLevel: listing.noiseLevel,
      recommendedFor: listing.recommendedFor,
    }}
  />
);
                })
              ) : (
                <div className="col-span-full text-center text-muted-foreground">
                  No accommodation has been added yet.
                </div>
              )}
            </div>

            <div className="mt-10 text-center">
              <Button asChild variant="outline">
                <Link href="/search">View All Accommodation</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full bg-background py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 rounded-2xl border bg-card p-8 md:grid-cols-2 md:p-10">
              <div>
                <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                  Spatially Oriented Search
                </h2>
                <p className="mt-4 text-muted-foreground md:text-lg">
                  The application combines accommodation data with map-based positioning, allowing
                  users to explore available units through location, category and capacity.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <h3 className="font-semibold">Map overview</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    View accommodation positions through interactive spatial presentation.
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <h3 className="font-semibold">Better decision-making</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Compare units by location, price, availability and accommodation type.
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <h3 className="font-semibold">Tourist-focused categories</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Support for tent pitches, camper places, bungalows, apartments and cottages.
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <h3 className="font-semibold">Reservation workflow</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Guests can submit reservation requests directly through the platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="w-full bg-muted/40 py-12 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                What Our Guests Say
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
                Experiences from visitors who stayed in our camp and accommodation units.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="flex flex-col bg-background">
                  <CardContent className="flex-1 p-6">
                    <p className="text-foreground/80">"{testimonial.comment}"</p>
                  </CardContent>

                  <CardHeader className="flex flex-row items-center gap-4 p-6 pt-0">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div>
                      <CardTitle className="text-base font-bold">{testimonial.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}