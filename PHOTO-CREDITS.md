# Photography register — AVC Dhanam Solutions

Checked: 1 November 2026. This update changes photography and image display styles only. Existing copy, figures, features, section order, links and controls are preserved.

## Implemented photographs

| Section / current placement | Photograph and credited contributor | Source | Licence |
|---|---|---|---|
| Mutual Funds & SIPs: home service card and `/services/investments` | Couple reviewing household finances at home — **Ketut Subiyanto** | [Pexels 4308013](https://www.pexels.com/photo/happy-couple-looking-at-paperwork-4308013/) | [Pexels License](https://www.pexels.com/license/), free commercial website use; no endorsement implied |
| Business Loans: existing combined loan card and `/services/loans` | Shopkeeper working in Karkala, Karnataka — **Abhijit Dey** | [Pexels 30520641](https://www.pexels.com/photo/vibrant-indian-street-shop-in-karkala-30520641/) | Pexels License; illustrative small-business setting, not an actual AVC customer; ownership of the shop is not independently asserted |
| Insurance: home service card and `/services/insurance` | Family relaxing in their living room — **World Sikh Organization of Canada**, the credited Pexels contributor | [Pexels 14798018](https://www.pexels.com/photo/a-family-watching-together-in-the-living-room-14798018/) | Pexels License; the source does not individually name the photographer. The family is depicted in a Sikh cultural setting; no nationality, client relationship or endorsement is asserted |
| Tax & Accounting: home service card and `/services/tax` | Accountant reviewing papers at a desk — **Yan Krukau** | [Pexels 7691663](https://www.pexels.com/photo/a-woman-looking-the-papers-7691663/) | Pexels License; the papers do not expose readable confidential identifiers in the selected composition |

The Pexels licence permits free website/commercial use and requires avoiding implied endorsement, offensive portrayal and resale/redistribution as standalone stock. These photographs illustrate services only. No subject is labelled as AVC staff, a director, a client, a review author or a partner. The stock office in the accounting image illustrates the accounting service only, never the Contact/office section.

Source pages identify photographic contributors; the planning image includes Sony ILCE-7M3 camera metadata, the Karkala shop image Fujifilm X-T50 metadata, and the family-at-home image Sony ILCE-7RM3 metadata. Published photographic series and visual inspection were used to reject generated/illustrated candidates. No AI generation or generative editing was used.

## Preserved original photographs and missing assets

| Requested section | Outcome |
|---|---|
| Homepage banner | **Unchanged / replacement pending.** No verified free photograph matching an Indian professional meeting an Indian couple over documents was selected. The existing banner is retained under the requested leave-unchanged fallback. Its provenance has not been authenticated by this update, and it is not represented as an approved stock selection. A licensed original matching the brief is still needed. |
| Home Loans | **Unchanged / exact asset pending.** No suitable verified photograph of an Indian couple viewing a home with a representative was selected. The current site has one combined loan service page; no new page, copy or section was added. |
| Business Funding | **Unchanged / exact asset and placement pending.** No verified photograph of Indian business owners planning together was selected. There is no separate funding photo placement in the current four-service layout; none was invented. |
| About Us | **Original director portraits preserved byte-for-byte.** Chandresh Pandey: original user upload `chandresh Pandey.jpeg`, served as `/assets/founders/chandresh-pandey-portrait.jpg`. Ajay Pandey: original user upload `Ajay Pandey.jpeg`, served as `/assets/founders/ajay-pandey-portrait.jpg`. No colour, skin, facial, expression, identity or format changes. No stock team members or additional unassigned people were added. |
| Contact | **Unchanged / original office photo required.** No verified user-owned office entrance/interior/building photo was found. No stock office or skyline was substituted as the actual office. Please supply the original office photograph. |
| Logo | `/logo_gold_transparent.svg` remains byte-for-byte unchanged. No recreation, tracing or recolouring. |

## Delivery and image handling

- Approved stock images are served locally from `public/assets/photography/`, copied to `dist/assets/photography/` by Vite.
- Each has responsive 480/960/1600px WebP sources and a JPEG fallback, short descriptive alt text, reserved image-frame geometry, and explicit source dimensions.
- Home-page service images are lazy loaded. Service-page lead photographs load eagerly because they can appear on the first screen.
- Original uploads retain their existing JPEG files rather than being re-encoded, to respect the instruction not to alter them.
- Only stock-image orientation, resizing and format compression were applied. Display cropping is done with CSS and separate focal positions for cards/lead photographs. No skin smoothing, facial edits, compositing, replacement backgrounds or colour grading.
- Full credit metadata, download URLs, input SHA-256 hashes and processing notes: [`public/assets/photography/credits.json`](public/assets/photography/credits.json).
- Desktop/mobile visual checks and before/after content/structure checks are captured in `audit-results/` (local, ignored by Git).
