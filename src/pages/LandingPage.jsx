import {Activity, CircleHelp,Bell,Building2,ChevronDown,Droplet,Heart,Info,Lock,Mail,MapPin,MessageCircle,MessageSquare,Phone,Quote,Search,ShieldCheck,Signal,Star,Truck,Users,Zap} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import deliveryPartnerImage from "../assets/delivery_partner.png";
import ContactSection from "../components/ContactSection";

const Button = ({ className = "", children, type = "button", ...props }) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const CardContent = ({ className = "", children }) => (
  <div className={className}>{children}</div>
);

const testimonials = [
  {
    name: "Rohit S.",
    role: "Patient",
    quote:
      '"BIT helped me find O+ blood in just 15 minutes. The delivery was super fast. Thank you!"',
    imageAlt: "Rohit",
    imageSrc:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHNtaWxpbmd8ZW58MXwyfHx8MTc4NDY2MDkxN3ww&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    name: "Priya M.",
    role: "Donor",
    quote:
      '"As a donor, I love how easy it is to help people in my area. The chat feature is superb!"',
    imageAlt: "Priya",
    imageSrc:
      "https://images.unsplash.com/photo-1770396529113-ba031cbf0cfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBoZWFkc2hvdHxlbnwxfDJ8fHwxNzg0NjYwOTI1fDA&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    name: "New Life Blood Bank",
    role: "Blood Bank",
    quote:
      '"BIT connects us with people in need quickly. It\'s a wonderful platform for everyone."',
    imageAlt: "Blood bank staff",
    imageSrc:
      "https://images.unsplash.com/photo-1643297654416-05795d62e39c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjB3b21hbiUyMHNtaWxpbmclMjBwb3J0cmFpdHxlbnwxfDJ8fHwxNzg0NjYwOTE2fDA&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    name: "Aarav K.",
    role: "Volunteer",
    quote:
      '"The alerts are clear and fast. I can respond to nearby requests without calling multiple hospitals."',
    imageAlt: "Aarav",
    imageSrc:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    name: "City Care Hospital",
    role: "Hospital",
    quote:
      '"Managing urgent blood needs is simpler now. BIT helps our team coordinate with donors in minutes."',
    imageAlt: "Hospital staff",
    imageSrc:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
];

const faqs = [
  {
    question: "What is BIT?",
    answer:
      "BIT, Blood In Time, is a smart platform that connects patients, donors, blood banks and delivery partners during urgent blood needs. It helps people find the right blood group faster and coordinate support from one place.",
  },
  {
    question: "How does BIT work?",
    answer:
      "BIT first checks nearby blood banks for available stock. If the required blood is not available, it can recommend eligible nearby donors and help users continue the request quickly.",
  },
  {
    question: "Is blood availability updated in real time?",
    answer:
      "Yes. BIT is designed to show real-time blood stock from partnered blood banks, so patients and hospitals can make faster decisions during emergencies.",
  },
  {
    question: "Can I track my blood delivery?",
    answer:
      "Yes. After a request is confirmed, BIT can help track delivery progress so users know when the blood is on the way and when it is expected to arrive.",
  },
  {
    question: "Is my personal information secure?",
    answer:
      "Yes. BIT is built with security in mind, using protected account access and industry-standard practices to keep personal details, contact information and request history safe.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [likedTestimonials, setLikedTestimonials] = useState(
    testimonials.map(() => false)
  );
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleTestimonialLike = (index) => {
    setLikedTestimonials((currentLikes) =>
      currentLikes.map((isLiked, currentIndex) =>
        currentIndex === index ? !isLiked : isLiked
      )
    );
  };

  const scrollToTestimonials = (target) => {
    document
      .getElementById(target)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div className="bg-white scroll-smooth text-zinc-950 w-full h-fit overflow-hidden h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <nav className="sticky z-50 backdrop-blur-md bg-white/90 border-zinc-200 border-t-0 border-r-0 border-b-1 border-l-0 border-solid top-0 w-full">
          <div className="max-w-[1140px] flex mx-auto px-8 py-4 justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="size-9 shadow-lg shadow-primary/30 transition-transform rounded-xl bg-[#fb2c36] text-red-50 flex justify-center items-center">
                <Droplet className="size-5 fill-primary-foreground" />
              </div>
              <div className="leading-none flex flex-col">
                <span className="font-extrabold text-xl leading-7 tracking-tight">
                  BIT
                </span>
                <span className="font-medium text-[#71717b] text-[10px]">
                  Blood In Time
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">

              <button onClick={()=>{scrollToTestimonials("How_it_Works")}} className="cursor-pointer transition-colors font-medium rounded-lg text-sm leading-5 flex px-3 py-2 items-center gap-1.5">
                <Info className="size-4" />
                <span className="relative">
                  How it Works
                  <span className="rounded-full bg-[#fb2c36] hidden absolute left-0 -bottom-1 w-full h-0.5" />
                </span>
              </button>

              <button onClick={()=>{scrollToTestimonials("faq")}} className="cursor-pointer transition-colors font-medium rounded-lg text-sm leading-5 flex px-3 py-2 items-center gap-1.5">
                <CircleHelp className="size-4" />
                <span className="relative">
                  Help
                  <span className="rounded-full bg-[#fb2c36] hidden absolute left-0 -bottom-1 w-full h-0.5" />
                </span>
              </button>
             
              
              <button
                onClick={()=>{scrollToTestimonials("testimonials")}}
                className="cursor-pointer transition-colors font-medium rounded-lg text-sm leading-5 flex px-3 py-2 items-center gap-1.5"
              > 
                <Quote className="size-4" />
                <span className="relative">
                  Testimonial
                  <span className="rounded-full bg-[#fb2c36] hidden absolute left-0 -bottom-1 w-full h-0.5" />
                </span>
              </button>

               <button onClick={()=>{scrollToTestimonials("contact")}} className="cursor-pointer transition-colors font-medium rounded-lg text-sm leading-5 flex px-3 py-2 items-center gap-1.5">
                <Mail className="size-4" />
                <span className="relative">
                  Contact Us
                  <span className="rounded-full bg-[#fb2c36] hidden absolute left-0 -bottom-1 w-full h-0.5" />
                </span>
              </button>
            
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate("/login")}
                className="shadow-lg shadow-primary/30 transition-transform rounded-full bg-[#fb2c36] text-red-50 px-5 py-2"
              >
                Login / Register
              </Button>
            </div>
          </div>
        </nav>
        <section className="relative bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
          <div className="pointer-events-none size-96 blur-3xl rounded-full bg-[#fb2c36]/10 absolute -right-32 top-10" />
          <div className="pointer-events-none size-72 blur-3xl rounded-full bg-[#fb2c36]/5 absolute -left-20 top-40" />
          <div className="grid max-w-[1140px] grid-cols-2 mx-auto px-8 py-16 items-center gap-8">
            <div className="flex flex-col gap-6">
              <div className="rounded-full bg-[#fb2c36]/10 border-[#fb2c36]/20 border-1 border-solid flex px-4 py-1.5 items-center gap-2 w-fit">
                <Droplet className="size-3.5 fill-primary [animation:pulse_1.5s_ease-in-out_infinite] text-[#fb2c36]" />
                <span className="font-semibold text-[#fb2c36] text-xs leading-4">
                  Every Drop Counts. Every Second Matters.
                </span>
              </div>
              <h1 className="font-extrabold text-6xl leading-[63px] tracking-tight">
                Right Blood.
                <br />
                Right Place.
                <br />
                <span className="inline-flex text-[#fb2c36] items-center gap-3">
                  Right Time.
                  <Activity className="size-9 [animation:pulse_1.2s_ease-in-out_infinite] text-[#fb2c36]" />
                </span>
              </h1>
              <p className="max-w-md leading-relaxed text-[#71717b] text-base leading-6">
                BIT connects patients, donors and blood banks in real time. Find
                the right blood, the nearest help and save lives.
              </p>
              <div className="flex items-center gap-4">
                <Button className="group shadow-xl shadow-primary/30 transition-all font-semibold rounded-full bg-[#fb2c36] text-red-50 text-base leading-6 p-6 gap-2">
                  <Search className="size-4 transition-transform" />
                  Find Blood Now
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  className="transition-all font-semibold rounded-full text-[#fb2c36] text-base leading-6 border-[#fb2c36]/30 border-0 border-solid p-6 gap-2"
                >
                  <Heart className="size-4" />
                  Become a Donor
                </Button>
              </div>
              <div className="flex pt-2 items-center gap-3">
                <div className="-space-x-3 flex">
                  <img
                    alt="Donor"
                    className="size-9 object-cover rounded-full border-white border-2 border-solid"
                    data-authorname="Christian Buehner"
                    data-authorurl="https://unsplash.com/@christianbuehner"
                    data-blurhash="LNB=SDm63YLN=h%gDjIWR5Wribiv"
                    data-photoid="JQFHdpOKz2k"
                    src="https://images.unsplash.com/photo-1562124638-724e13052daf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBlcnNvbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwxfDJ8fHwxNzg0NjYwOTE2fDA&ixlib=rb-4.1.0&q=80&w=400"
                  />
                  <img
                    alt="Donor"
                    className="size-9 object-cover rounded-full border-white border-2 border-solid"
                    data-authorname="Eben Kassaye"
                    data-authorurl="https://unsplash.com/@ebengech"
                    data-blurhash="LDE.%[Rp4,IT4-9H%M%MELo#v}i]"
                    data-photoid="Z7TAIOQgjWA"
                    src="https://images.unsplash.com/photo-1643297654416-05795d62e39c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjB3b21hbiUyMHNtaWxpbmclMjBwb3J0cmFpdHxlbnwxfDJ8fHwxNzg0NjYwOTE2fDA&ixlib=rb-4.1.0&q=80&w=400"
                  />
                  <img
                    alt="Donor"
                    className="size-9 object-cover rounded-full border-white border-2 border-solid"
                    data-authorname="Nicolas Horn"
                    data-authorurl="https://unsplash.com/@sysengineer"
                    data-blurhash="LqJ[0LoftQof~qWBNGofS%ocspt7"
                    data-photoid="MTZTGvDsHFY"
                    src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHNtaWxpbmd8ZW58MXwyfHx8MTc4NDY2MDkxN3ww&ixlib=rb-4.1.0&q=80&w=400"
                  />
                </div>
                <div className="leading-tight flex flex-col">
                  <span className="font-bold text-sm leading-5">
                    10,000+ life savers
                  </span>
                  <span className="text-[#71717b] text-xs leading-4">
                    are already making a difference
                  </span>
                </div>
              </div>
            </div>
            <div className="relative flex justify-center items-center">
              <div className="flex absolute inset-0 justify-center items-center">
                <div className="size-80 [animation:spin_18s_linear_infinite] rounded-full border-[#fb2c36]/20 border-1 border-dashed" />
              </div>
              <div className="relative z-10 shadow-2xl shadow-primary/20 transition-transform rounded-[40px] bg-white border-zinc-950 border-8 border-solid p-3 w-64">
                <div className="flex px-2 pb-2 justify-between items-center">
                  <span className="font-bold text-xs leading-4">
                    Finding Nearest Blood Bank
                  </span>
                  <Signal className="size-3.5 text-[#fb2c36]" />
                </div>
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    alt="map"
                    className="object-cover w-full h-56"
                    src="https://screens-image-components-public.s3.eu-north-1.amazonaws.com/city-navigation-map.png"
                  />
                  <div className="left-1/2 top-1/3 size-8 -translate-x-1/2 shadow-lg shadow-primary/40 [animation:bounce_1.6s_ease-in-out_infinite] rounded-full bg-[#fb2c36] text-red-50 flex absolute justify-center items-center">
                    <Droplet className="size-4 fill-primary-foreground" />
                  </div>
                  <div className="backdrop-blur rounded-xl bg-white/95 border-zinc-200 border-1 border-solid absolute inset-x-2 bottom-2 p-2">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-lg bg-[#fb2c36]/10 flex justify-center items-center">
                        <MapPin className="size-3.5 text-[#fb2c36]" />
                      </div>
                      <div className="leading-tight flex flex-col">
                        <span className="font-bold text-[10px]">
                          New Life Blood Bank
                        </span>
                        <span className="text-[#71717b] text-[9px]">
                          1.2 km away · Open now
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="z-20 shadow-lg [animation:bounce_2.4s_ease-in-out_infinite] rounded-full bg-white border-zinc-200 border-1 border-solid flex absolute -left-2 top-6 px-3 py-2 items-center gap-2">
                <div className="size-7 rounded-full bg-[#fb2c36]/10 flex justify-center items-center">
                  <Building2 className="size-3.5 text-[#fb2c36]" />
                </div>
                <span className="font-semibold text-xs leading-4">
                  Nearby Blood Banks
                </span>
              </div>
              <div className="z-20 shadow-lg [animation:bounce_2.8s_ease-in-out_infinite] rounded-full bg-white border-zinc-200 border-1 border-solid flex absolute -right-2 top-20 px-3 py-2 items-center gap-2">
                <div className="size-7 rounded-full bg-[#fb2c36]/10 flex justify-center items-center">
                  <Users className="size-3.5 text-[#fb2c36]" />
                </div>
                <span className="font-semibold text-xs leading-4">
                  Nearby Donors
                </span>
              </div>
              <div className="z-20 shadow-lg [animation:bounce_3.2s_ease-in-out_infinite] rounded-full bg-white border-zinc-200 border-1 border-solid flex absolute right-4 -bottom-2 px-3 py-2 items-center gap-2">
                <div className="size-7 rounded-full bg-[#fb2c36]/10 flex justify-center items-center">
                  <MessageCircle className="size-3.5 text-[#fb2c36]" />
                </div>
                <span className="font-semibold text-xs leading-4">
                  In-App Chat
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="max-w-[1140px] mx-auto px-8 pb-16">
          <div className="grid grid-cols-4 gap-4">
            <Card className="group transition-all border-zinc-200 border-0 border-solid p-6 gap-2">
              <div className="size-11 transition-transform rounded-xl bg-[#fb2c36]/10 text-[#fb2c36] flex justify-center items-center">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="font-bold text-base leading-6">{`Verified & Trusted`}</h3>
              <p className="text-[#71717b] text-xs leading-4">
                All donors and blood banks are verified for your safety.
              </p>
            </Card>
            <Card className="group transition-all border-zinc-200 border-0 border-solid p-6 gap-2">
              <div className="size-11 transition-transform rounded-xl bg-[#fb2c36]/10 text-[#fb2c36] flex justify-center items-center">
                <Zap className="size-5" />
              </div>
              <h3 className="font-bold text-base leading-6">
                Real-time Search
              </h3>
              <p className="text-[#71717b] text-xs leading-4">
                Instantly find nearest blood banks or donors.
              </p>
            </Card>
            <Card className="group transition-all border-zinc-200 border-0 border-solid p-6 gap-2">
              <div className="size-11 transition-transform rounded-xl bg-[#fb2c36]/10 text-[#fb2c36] flex justify-center items-center">
                <MessageSquare className="size-5" />
              </div>
              <h3 className="font-bold text-base leading-6">In-App Chat</h3>
              <p className="text-[#71717b] text-xs leading-4">
                Chat with donors, blood banks or delivery partners.
              </p>
            </Card>
            <Card className="group transition-all border-zinc-200 border-0 border-solid p-6 gap-2">
              <div className="size-11 transition-transform rounded-xl bg-[#fb2c36]/10 text-[#fb2c36] flex justify-center items-center">
                <Truck className="size-5" />
              </div>
              <h3 className="font-bold text-base leading-6">Safe Delivery</h3>
              <p className="text-[#71717b] text-xs leading-4">
                Fast and secure blood delivery to save lives.
              </p>
            </Card>
          </div>
        </section>
        <section id="How_it_Works" className="max-w-[1140px] scroll-mt-24  mx-auto px-8 pb-16">
          <div className="text-center flex mb-10 flex-col items-center gap-2">
            <span className="font-bold uppercase text-[#fb2c36] text-xs leading-4 tracking-widest">
              How it Works
            </span>
            <h2 className="font-extrabold text-4xl leading-10 tracking-tight">
              Getting Help is<span className="text-[#fb2c36]">Simple</span>
            </h2>
          </div>
          <div className="grid grid-cols-5 gap-4">
            <div className="group text-center flex flex-col items-center gap-3">
              <div className="relative size-16 transition-all rounded-full bg-[#fb2c36]/10 text-[#fb2c36] flex justify-center items-center">
                <Search className="size-6" />
                <span className="size-6 font-bold rounded-full bg-[#fb2c36] text-red-50 text-xs leading-4 flex absolute -right-1 -bottom-1 justify-center items-center">
                  1
                </span>
              </div>
              <h4 className="font-bold text-sm leading-5">Search Blood</h4>
              <p className="text-[#71717b] text-xs leading-4">{`Enter blood group & location to search nearby.`}</p>
            </div>
            <div className="group text-center flex flex-col items-center gap-3">
              <div className="relative size-16 transition-all rounded-full bg-[#fb2c36]/10 text-[#fb2c36] flex justify-center items-center">
                <Building2 className="size-6" />
                <span className="size-6 font-bold rounded-full bg-[#fb2c36] text-red-50 text-xs leading-4 flex absolute -right-1 -bottom-1 justify-center items-center">
                  2
                </span>
              </div>
              <h4 className="font-bold text-sm leading-5">We Find For You</h4>
              <p className="text-[#71717b] text-xs leading-4">
                We reveal nearest blood banks and donors nearby.
              </p>
            </div>
            <div className="group text-center flex flex-col items-center gap-3">
              <div className="relative size-16 transition-all rounded-full bg-[#fb2c36]/10 text-[#fb2c36] flex justify-center items-center">
                <MessageCircle className="size-6" />
                <span className="size-6 font-bold rounded-full bg-[#fb2c36] text-red-50 text-xs leading-4 flex absolute -right-1 -bottom-1 justify-center items-center">
                  3
                </span>
              </div>
              <h4 className="font-bold text-sm leading-5">{`Connect & Chat`}</h4>
              <p className="text-[#71717b] text-xs leading-4">
                Chat directly to confirm availability.
              </p>
            </div>
            <div className="group text-center flex flex-col items-center gap-3">
              <div className="relative size-16 transition-all rounded-full bg-[#fb2c36]/10 text-[#fb2c36] flex justify-center items-center">
                <Truck className="size-6" />
                <span className="size-6 font-bold rounded-full bg-[#fb2c36] text-red-50 text-xs leading-4 flex absolute -right-1 -bottom-1 justify-center items-center">
                  4
                </span>
              </div>
              <h4 className="font-bold text-sm leading-5">Get it Delivered</h4>
              <p className="text-[#71717b] text-xs leading-4">
                Choose delivery or pick-up. Our delivery partners reach you
                safely.
              </p>
            </div>
            <div className="group text-center flex flex-col items-center gap-3">
              <div className="relative size-16 transition-all rounded-full bg-[#fb2c36]/10 text-[#fb2c36] flex justify-center items-center">
                <Heart className="size-6" />
                <span className="size-6 font-bold rounded-full bg-[#fb2c36] text-red-50 text-xs leading-4 flex absolute -right-1 -bottom-1 justify-center items-center">
                  5
                </span>
              </div>
              <h4 className="font-bold text-sm leading-5">Save Lives</h4>
              <p className="text-[#71717b] text-xs leading-4">{`Your act of kindness brings hope & saves lives.`}</p>
            </div>
          </div>
        </section>
        <section className="max-w-[1140px] mx-auto px-8 pb-16">
          <div className="relative rounded-3xl bg-gradient-to-br from-[#86131a] via-[#b8232d] to-[#fb2c36] px-10 py-8 text-red-50 shadow-2xl shadow-red-500/25 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.24),transparent_32%),radial-gradient(circle_at_14%_85%,rgba(255,255,255,0.14),transparent_28%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-white/10" />
            <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border border-white/20" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 size-72 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid grid-cols-[1fr_2fr] items-center gap-8">
              <div className="flex flex-col gap-4">
                <span className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase leading-4 tracking-widest text-white/90 backdrop-blur">
                  Community impact
                </span>
                <h2 className="font-extrabold text-3xl leading-tight tracking-tight">
                  Together, We Can Create a Lifesaving Impact
                </h2>
                <p className="max-w-sm text-sm leading-6 text-red-50/85">
                  BIT is more than an app. It's a movement of kind hearts
                  working together.
                </p>
                <Button
                  onClick={() => navigate("/register")}
                  className="group w-fit rounded-full bg-white px-5 py-2.5 font-semibold text-[#fb2c36] shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/15 gap-2"
                >
                  <Heart className="size-4 transition-transform duration-300 group-hover:scale-110" />
                  Join Us Today
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="group flex min-h-28 flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/15 bg-white/15 p-4 text-center shadow-lg shadow-black/5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 hover:shadow-xl">
                  <Users className="size-6 text-white/90 transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-extrabold text-2xl leading-8 tracking-tight">
                    10,000+
                  </span>
                  <span className="text-xs font-medium leading-4 text-red-50/85">
                    Active donors
                  </span>
                </div>
                <div className="group flex min-h-28 flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/15 bg-white/15 p-4 text-center shadow-lg shadow-black/5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 hover:shadow-xl">
                  <Droplet className="size-6 text-white/90 transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-extrabold text-2xl leading-8 tracking-tight">
                    50,000+
                  </span>
                  <span className="text-xs font-medium leading-4 text-red-50/85">
                    Blood banks
                  </span>
                </div>
                <div className="group flex min-h-28 flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/15 bg-white/15 p-4 text-center shadow-lg shadow-black/5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 hover:shadow-xl">
                  <Heart className="size-6 text-white/90 transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-extrabold text-2xl leading-8 tracking-tight">
                    25,000+
                  </span>
                  <span className="text-xs font-medium leading-4 text-red-50/85">
                    Lives saved
                  </span>
                </div>
                <div className="group flex min-h-28 flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/15 bg-white/15 p-4 text-center shadow-lg shadow-black/5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 hover:shadow-xl">
                  <Truck className="size-6 text-white/90 transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-extrabold text-2xl leading-8 tracking-tight">
                    1,200+
                  </span>
                  <span className="text-xs font-medium leading-4 text-red-50/85">
                    Deliveries done
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="max-w-[1140px] mx-auto px-8 pb-16">
          <div className="grid grid-cols-2 items-center gap-10">
            <div className="flex flex-col gap-5">
              <span className="font-bold uppercase rounded-full bg-[#fb2c36]/10 text-[#fb2c36] text-xs leading-4 tracking-widest px-3 py-1 w-fit">{`Smart & Secure`}</span>
              <h2 className="font-extrabold text-4xl leading-10 tracking-tight">
                Everything You Need, All in
                <span className="text-[#fb2c36]">One Place</span>
              </h2>
              <div className="flex flex-col gap-3">
                <div className="transition-colors rounded-xl border-zinc-200 border-1 border-solid flex p-3 items-center gap-3">
                  <Search className="size-5 text-[#fb2c36]" />
                  <span className="font-medium text-sm leading-5">{`Smart search for blood banks & donors`}</span>
                </div>
                <div className="transition-colors rounded-xl border-zinc-200 border-1 border-solid flex p-3 items-center gap-3">
                  <MessageCircle className="size-5 text-[#fb2c36]" />
                  <span className="font-medium text-sm leading-5">
                    Real-time chat for quick communication
                  </span>
                </div>
                <div className="transition-colors rounded-xl border-zinc-200 border-1 border-solid flex p-3 items-center gap-3">
                  <Truck className="size-5 text-[#fb2c36]" />
                  <span className="font-medium text-sm leading-5">
                    Secure blood delivery with live tracking
                  </span>
                </div>
                <div className="transition-colors rounded-xl border-zinc-200 border-1 border-solid flex p-3 items-center gap-3">
                  <Bell className="size-5 text-[#fb2c36]" />
                  <span className="font-medium text-sm leading-5">{`Notifications & alerts for urgent needs`}</span>
                </div>
                <div className="transition-colors rounded-xl border-zinc-200 border-1 border-solid flex p-3 items-center gap-3">
                  <Lock className="size-5 text-[#fb2c36]" />
                  <span className="font-medium text-sm leading-5">{`100% safe, secure & privacy focused`}</span>
                </div>
              </div>
              
            </div>
            <div className="relative flex justify-center">
              <div className="pointer-events-none flex absolute inset-0 justify-center items-center">
                <div className="size-72 blur-2xl rounded-full bg-[#fb2c36]/10" />
              </div>
              <img
                alt="BIT delivery rider"
                className="relative z-10 object-cover shadow-2xl shadow-primary/20 transition-transform rounded-3xl w-100 h-96"
                src={deliveryPartnerImage}
              />
              <div className="z-20 shadow-xl [animation:bounce_2.6s_ease-in-out_infinite] rounded-2xl bg-white border-zinc-200 border-1 border-solid flex absolute -left-2 bottom-6 p-3 items-center gap-2">
                <div className="size-9 rounded-xl bg-[#fb2c36]/10 flex justify-center items-center">
                  <MapPin className="size-4 text-[#fb2c36]" />
                </div>
                <div className="leading-tight flex flex-col">
                  <span className="font-bold text-xs leading-4">
                    On the way
                  </span>
                  <span className="text-[#71717b] text-[10px]">
                    Arriving in 8 min
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          id="testimonials"
          className="max-w-[1140px] scroll-mt-24 mx-auto px-8 pb-16"
        >
          <div className="text-center flex mb-10 flex-col items-center gap-2">
            <span className="font-bold uppercase text-[#fb2c36] text-xs leading-4 tracking-widest flex items-center gap-2">
              <Quote className="size-4" />
              What People Say
            </span>
            <h2 className="font-extrabold text-4xl leading-10 tracking-tight">
              Trusted by<span className="text-[#fb2c36]">Thousands</span>
            </h2>
          </div>
          <div className="testimonial-scroll flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4">
            {testimonials.map((testimonial, index) => (
              <Card
                key={testimonial.name}
                className="testimonial-card transition-all duration-300 border-zinc-200 border border-solid p-6 hover:-translate-y-1 hover:shadow-xl"
              >
                <CardContent className="h-full flex p-0 flex-col gap-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="text-yellow-400 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className="size-4 fill-yellow-400"
                        />
                      ))}
                    </div>
                    <div className="size-9 shrink-0 rounded-full bg-[#fb2c36]/10 text-[#fb2c36] flex items-center justify-center">
                      <Quote className="size-4" />
                    </div>
                  </div>
                  <p className="leading-relaxed text-[#71717b] text-sm leading-5 grow">
                    {testimonial.quote}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        alt={testimonial.imageAlt}
                        className="size-10 object-cover rounded-full"
                        src={testimonial.imageSrc}
                      />
                      <div className="leading-tight min-w-0 flex flex-col">
                        <span className="font-bold text-sm leading-5 truncate">
                          {testimonial.name}
                        </span>
                        <span className="text-[#71717b] text-xs leading-4">
                          {testimonial.role}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={
                        likedTestimonials[index]
                          ? `Unlike ${testimonial.name} testimonial`
                          : `Like ${testimonial.name} testimonial`
                      }
                      aria-pressed={likedTestimonials[index]}
                      onClick={() => toggleTestimonialLike(index)}
                      className={`shrink-0 rounded-full p-2 transition-all duration-300 hover:scale-110 ${
                        likedTestimonials[index]
                          ? "text-[#fb2c36]"
                          : "text-black hover:text-[#fb2c36]"
                      }`}
                    >
                      <Heart
                        className={`size-6 transition-all duration-300 ${
                          likedTestimonials[index]
                            ? "fill-[#fb2c36]"
                            : "fill-none"
                        }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        <section id="faq" className="max-w-[900px] scroll-mt-24 mx-auto px-8 pb-16">
          <div className="text-center flex mb-8 flex-col items-center gap-2">
            <span className="font-bold uppercase text-[#fb2c36] text-xs leading-4 tracking-widest flex items-center gap-2">
              <MessageCircle className="size-4" />
              FAQ
            </span>
            <h2 className="font-extrabold text-3xl leading-10 tracking-tight">
              Common Questions
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <Card
                  key={faq.question}
                  className="border border-zinc-200 border-solid overflow-hidden transition-all duration-300 hover:shadow-md"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <span className="font-bold text-sm leading-5">
                      {faq.question}
                    </span>
                    <span
                      className={`size-8 shrink-0 rounded-full bg-[#fb2c36]/10 text-[#fb2c36] flex items-center justify-center transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <ChevronDown className="size-4" />
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-[#71717b] text-sm leading-6">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
        <ContactSection />
        <footer className="bg-gradient-to-b from-primary/5 to-background border-zinc-200 border-t-1 border-r-0 border-b-0 border-l-0 border-solid">
          <div className="grid max-w-[1140px] grid-cols-4 mx-auto px-8 py-12 gap-8">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="size-9 rounded-xl bg-[#fb2c36] text-red-50 flex justify-center items-center">
                  <Droplet className="size-5 fill-primary-foreground" />
                </div>
                <div className="leading-none flex flex-col">
                  <span className="font-extrabold text-xl leading-7">BIT</span>
                  <span className="text-[#71717b] text-[10px]">
                    Blood In Time
                  </span>
                </div>
              </div>
              <p className="text-[#71717b] text-sm leading-5">
                Connecting hearts. Saving lives.
              </p>
              <div className="flex items-center gap-2">
                <div className="size-8 transition-colors rounded-full bg-zinc-100 text-[#71717b] flex justify-center items-center">
                  <MessageCircle className="size-4" />
                </div>
                <div className="size-8 transition-colors rounded-full bg-zinc-100 text-[#71717b] flex justify-center items-center">
                  <Mail className="size-4" />
                </div>
                <div className="size-8 transition-colors rounded-full bg-zinc-100 text-[#71717b] flex justify-center items-center">
                  <Phone className="size-4" />
                </div>
                <div className="size-8 transition-colors rounded-full bg-zinc-100 text-[#71717b] flex justify-center items-center">
                  <Users className="size-4" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-sm leading-5 mb-1">Quick Links</h4>
              <span className="transition-colors text-[#71717b] text-sm leading-5">
                Home
              </span>
              <span className="transition-colors text-[#71717b] text-sm leading-5">
                How it Works
              </span>
              <span className="transition-colors text-[#71717b] text-sm leading-5">
                Find Blood
              </span>
              <span className="transition-colors text-[#71717b] text-sm leading-5">
                For Donors
              </span>
              <span className="transition-colors text-[#71717b] text-sm leading-5">
                Blood Banks
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-sm leading-5 mb-1">Resources</h4>
              <span className="transition-colors text-[#71717b] text-sm leading-5">
                FAQs
              </span>
              <span className="transition-colors text-[#71717b] text-sm leading-5">
                Blog
              </span>
              <span className="transition-colors text-[#71717b] text-sm leading-5">
                Privacy Policy
              </span>
              <span className="transition-colors text-[#71717b] text-sm leading-5">{`Terms & Conditions`}</span>
              <span className="transition-colors text-[#71717b] text-sm leading-5">
                Refund Policy
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-sm leading-5">Emergency Help</h4>
              <div className="text-[#71717b] text-sm leading-5 flex items-center gap-2">
                <Phone className="size-4 text-[#fb2c36]" />
                24/7 Helpline
              </div>
              <span className="font-extrabold text-[#fb2c36] text-lg leading-7">
                +91 12345 67890
              </span>
              <div className="text-[#71717b] text-sm leading-5 flex items-center gap-2">
                <Mail className="size-4 text-[#fb2c36]" />
                support@bitblood.org
              </div>
            </div>
          </div>
          <div className="border-zinc-200 border-t-1 border-r-0 border-b-0 border-l-0 border-solid py-4">
            <p className="text-center text-[#71717b] text-xs leading-4">
              © 2024 BIT · Blood In Time. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
