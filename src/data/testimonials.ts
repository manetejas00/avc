export type TestimonialDraft = {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
};

// Original website copy and images from commit 15aa53d. Not verified client endorsements.
export const testimonialDrafts: TestimonialDraft[] = [
  {
    "id": "rajesh-sharma",
    "name": "Rajesh Sharma",
    "role": "Managing Director, TechVentures Mumbai",
    "quote": "AVC Dhanam's SIP and portfolio management guidance helped us structure our wealth tax-efficiently. The transparency and real-time market data give us full control.",
    "image": "/assets/testimonials/client-rajesh.webp"
  },
  {
    "id": "ananya-patel",
    "name": "Ananya Patel",
    "role": "VP Product & Investor, Bengaluru",
    "quote": "Investing in mutual funds and PMS through AVC has been seamless. Their market analytics and advisor support are top tier.",
    "image": "/assets/testimonials/client-ananya.webp"
  },
  {
    "id": "vikram-mehta",
    "name": "Vikram Mehta",
    "role": "Co-Founder, Capital Growth",
    "quote": "The level of expertise and SEBI compliance rigor AVC provides gives us total confidence for our corporate liquidity investments.",
    "image": "/assets/testimonials/client-vikram.webp"
  },
  {
    "id": "priya-nair",
    "name": "Priya Nair",
    "role": "Senior Financial Strategist, Mumbai",
    "quote": "AVC Dhanam simplifies equity research and mutual fund selection. Their personalized consultation helped us hit our long-term wealth goals.",
    "image": "/assets/testimonials/client-priya.webp"
  }
];
