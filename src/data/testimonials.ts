export type ClientReview = {
  id: string;
  name: string;
  quote: string;
};

// Add only client-approved names and review text. Display is limited to ten reviews.
export const clientReviews: ClientReview[] = [];
