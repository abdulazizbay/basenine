# BaseNine (API + admin)

Backend for BaseNine, a baseball site built around the Korean league. It does
two jobs:

1. A JSON API for the React frontend, which lives in
   [basenine-react](https://github.com/abdulazizbay/basenine-react)
2. A server-rendered admin panel at `/admin`, built with EJS, where the data
   actually gets entered — teams, players, products, fixtures and final scores

Express + TypeScript + MongoDB via Mongoose. Built while studying, so it
follows the controller / service / schema split from the course projects.

## Running it

```bash
npm install
npm run start:dev
```

`.env` needs four things:

```
PORT=3002
MONGO_URL=mongodb+srv://...
SESSION_SECRET=...
SECRET_TOKEN=...
```

`start:dev` runs under nodemon. Plain `npm start` doesn't watch, so if you edit
a file and the change seems to do nothing, that's usually why.

The admin panel is at `http://localhost:3002/admin` and needs an admin login.

## Layout

```
src/
  controllers/   request handling, one per resource
  models/        business logic (*.service.ts) — the real work happens here
  schema/        Mongoose models
  libs/          types, enums, error classes, config
  views/         EJS templates for the admin panel
  public/        admin CSS and JS
  router.ts      API routes for the React app
  router-admin.ts  admin panel routes
```

Controllers stay thin: read the request, build an inquiry object, hand it to a
service, return the result. Anything involving aggregation lives in the
service.

## A few things worth knowing

**Auth is split.** The API uses a JWT in a cookie (`verifyAuth` for required,
`retrieveAuth` for optional). The admin panel uses an express-session stored in
Mongo. They're separate on purpose.

**Pagination is a `$facet`.** Most list endpoints return
`{ list, metaCounter }` — the list is `$skip`/`$limit`ed inside the facet while
`metaCounter` counts the whole match. Same shape everywhere so the frontend can
treat them alike.

**Favourites and views are generic.** Both are one collection tagged with a
group and a ref id (`favouriteGroup` + `favouriteRefId`), which is why
subscribing to a team and tracking a recently-viewed product share the same
machinery. In practice only teams get favourited.

**Standings are computed, not stored.** `getStandings()` unpivots each finished
game into two rows — one per team — then groups them. There's no standings
collection, because the games already are the source of truth and a stored
table would just be a copy that can drift. Games Behind needs the leader's
record, so it's calculated in JavaScript after the aggregation sorts.

**Game ordering depends on status.** Fixtures come back oldest first (the next
game is the interesting one), finished games newest first (the last result is).
That's derived from `gameStatus` rather than passed in, so no caller has to
remember.

**Route order matters** in `router.ts`. `/game/standings` and `/team/visited`
have to sit above `/game/:id` and `/team/:id`, or Express treats "standings" as
an id.

