export type IllustrativeStory = {
  id: string;
  name: string;
  topic: string;
  story: string;
  avatar: number;
};

// Fictional educational scenarios. These are not client identities or endorsements.
export const illustrativeStories: IllustrativeStory[] = [
  { id: 'aarav', name: 'Aarav Sharma', topic: 'Starting a SIP', avatar: 0, story: 'Aarav is starting his first job and wants a regular saving habit. His next step is to review his budget, build an emergency fund and understand mutual-fund risk before choosing a SIP.' },
  { id: 'priya', name: 'Priya Deshmukh', topic: 'Comparing home loans', avatar: 1, story: 'Priya is comparing home-loan offers for her first apartment. She looks beyond the advertised rate to processing fees, floating-rate changes and the monthly payment she can comfortably afford.' },
  { id: 'rohan', name: 'Rohan Patel', topic: 'Planning business funding', avatar: 2, story: 'Rohan wants to expand his small business. Before approaching lenders, he prepares bank statements, tax returns and a cash-flow estimate to understand how repayments would fit his business.' },
  { id: 'sneha', name: 'Sneha Iyer', topic: 'Understanding health cover', avatar: 3, story: 'Sneha is reviewing health insurance for her family. She compares waiting periods, exclusions, room limits and hospital networks, then checks the policy wording before making a decision.' },
  { id: 'vikram', name: 'Vikram Singh', topic: 'Preparing tax records', avatar: 4, story: 'Vikram wants his tax documents organised before filing season. He gathers income records and supporting statements, and prepares questions for a qualified tax professional about his circumstances.' },
  { id: 'ananya', name: 'Ananya Nair', topic: 'Saving for education', avatar: 5, story: 'Ananya is planning for future education expenses. She separates near-term costs from longer-term goals and considers how much uncertainty she can accept without putting essential spending at risk.' },
  { id: 'rahul', name: 'Rahul Kulkarni', topic: 'Reviewing existing funds', avatar: 6, story: 'Rahul holds several mutual funds and wants to understand what he owns. He checks overlapping holdings, plan types, expenses and dated returns before considering whether any changes are needed.' },
  { id: 'meera', name: 'Meera Joshi', topic: 'Preparing for retirement', avatar: 7, story: 'Meera is estimating her retirement needs. She reviews expected living costs, inflation assumptions, healthcare expenses and available savings, using projections as a starting point rather than a promise.' },
  { id: 'arjun', name: 'Arjun Reddy', topic: 'Understanding term insurance', avatar: 8, story: 'Arjun is thinking about financial protection for his dependants. He reviews household commitments, existing cover and policy exclusions, and understands that eligibility and pricing depend on underwriting.' },
  { id: 'kavya', name: 'Kavya Shah', topic: 'Reading an IPO offer', avatar: 9, story: 'Kavya is learning how to read an IPO offer document. She checks the business risks, use of proceeds, valuation and application terms, knowing that allotment and listing gains are never guaranteed.' },
];
