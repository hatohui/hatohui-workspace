# Art features

A single artist's site: about page, gallery and commission tracker. Public at `/`; the artist workspace is at `/app`.

## Visitors and clients

| Feature            | Sub-features                                                                                                                                                                                                                                                    | Spec                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| About page         | • Animated intro<br>• Fun facts<br>• About me text<br>• Recent work                                                                                                                                                                                             | [spec](../../docs/specs/art/single-artist/README.md)   |
| Gallery            | • Browse artwork<br>• Search<br>• Tag filter<br>• Artwork page<br>• Zoom viewer<br>• Download original<br>• Title and description                                                                                                                               |                                                        |
| Projects           | • Project list<br>• Project page                                                                                                                                                                                                                                |                                                        |
| Order a commission | • Opening status<br>• Type and option<br>• Add-ons<br>• Price preview<br>• Deadline and rush<br>• Reference images and links<br>• Contact method<br>• Account identity match<br>• Guest ordering<br>• Passcode<br>• Hide from public queue<br>• Terms agreement | [spec](../../docs/specs/art/order-a-commission/prd.md) |
| Order page         | • Access by code<br>• Stage tracker<br>• Progress timeline<br>• Add references<br>• Notes thread<br>• Set passcode                                                                                                                                              | [spec](../../docs/specs/art/order-a-commission/prd.md) |
| Public queue       | • Work-order list<br>• Stage and queued date<br>• Unlock an entry by passcode<br>• Open by access code<br>• Find my orders by email and passcode                                                                                                                | [spec](../../docs/specs/art/queue-passcodes/README.md) |
| Commission groups  | • Group page by code<br>• Member orders<br>• Comments                                                                                                                                                                                                           | [spec](../../docs/specs/art/commission-open/prd.md)    |
| Onboarding         | • Opt in<br>• Profile<br>• Handle<br>• Skip                                                                                                                                                                                                                     |                                                        |
| Preferences        | • Language<br>• Theme                                                                                                                                                                                                                                           |                                                        |

## Artist workspace

| Feature             | Sub-features                                                                                                                                                   | Spec                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Dashboard           | • Stats<br>• Needs attention<br>• Upcoming deadlines<br>• Current opening and slots<br>• Recent requests                                                       |                                                        |
| About page editor   | • Headline and intro<br>• Markdown about text<br>• Fun facts                                                                                                   | [spec](../../docs/specs/art/single-artist/README.md)   |
| Requests            | • Review requests<br>• Accept or decline<br>• Send a quote<br>• Adjust the quote                                                                               | [spec](../../docs/specs/art/commission-open/prd.md)    |
| Commissions         | • Kanban board<br>• Status<br>• Payment status<br>• Step checklist<br>• Client visibility<br>• Notes<br>• Progress updates<br>• Finalize progress<br>• Deliver | [spec](../../docs/specs/art/commission-open/prd.md)    |
| Passcodes           | • Generate<br>• Custom passcode<br>• Clear                                                                                                                     | [spec](../../docs/specs/art/queue-passcodes/README.md) |
| Clients             | • Contact details<br>• Order history<br>• Linked account                                                                                                       | [spec](../../docs/specs/art/order-a-commission/prd.md) |
| Pricing             | • Offered commission types<br>• Options and prices<br>• Add-ons<br>• Rush fee<br>• Type examples                                                               | [spec](../../docs/specs/art/commission-open/prd.md)    |
| Commission settings | • Auto-accept<br>• Currency<br>• Notification email<br>• Payment methods                                                                                       | [spec](../../docs/specs/art/commission-open/prd.md)    |
| Openings            | • Create and edit<br>• Schedule<br>• Open and close<br>• Slot cap<br>• Delete                                                                                  | [spec](../../docs/specs/art/commission-open/prd.md)    |
| Gallery management  | • Batch upload<br>• Tags and tag suggestions<br>• Edit details<br>• Bulk tag<br>• Bulk delete<br>• Private toggle<br>• Hide private                            | [spec](../../docs/specs/art/storage-layout/README.md)  |
| Projects management | • Create, edit and delete<br>• Add and remove art<br>• Private toggle                                                                                          |                                                        |
| Groups management   | • Create and edit<br>• Add and remove members                                                                                                                  | [spec](../../docs/specs/art/commission-open/prd.md)    |

## Planned

| Feature                 | Sub-features                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| Art onboarding steps    | • Art-specific steps after the shared identity steps                                        |
| Commissions             | • Private commission<br>• Priority<br>• Delete a commission<br>• Confirmation email         |
| Passcodes               | • View current passcode                                                                     |
| Commission type catalog | • Create, edit and delete types                                                             |
| Clients                 | • Look up a client by email                                                                 |
| Follow an artist        | • Subscribe<br>• Unsubscribe<br>• Follower list<br>• Email followers when an opening starts |
