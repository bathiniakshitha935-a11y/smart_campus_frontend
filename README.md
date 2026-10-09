# Smart Campus Frontend

React + Vite client for the Smart Campus map and campus navigation.

## Local development

Run `npm install` and `npm run dev`. `.env.development` configures the local API base URL. `VITE_API_URL` should point to the backend API base and end with `/api`.

## Deployment

The standalone Render Blueprint is `render.yaml`. It prompts for `VITE_API_URL` at deployment setup. Vercel uses the same build command (`npm run build`), output directory (`dist`), and environment variable. Do not place deployment URLs, secrets, or credentials in the source.

The campus map, location list, and route navigation are available from the home page.
