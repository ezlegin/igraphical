# Signed links for dl.igraphical.ir (cPanel)

Course files stop being reachable by their plain URL. The app hands out
`https://dl.igraphical.ir/v.php?p=…&u=…&e=…&s=…` links that work for 3 hours
and only with a valid signature; `v.php` checks them and streams the file
(seeking works). Course teasers (`tizer.mp4` / `teaser.mp4`) stay public.

Do the steps **in this order**: blocking `/Courses` before the app signs
links would break every video.

## 1. Create the shared secret

Generate one long random value (64 characters), for example:

```bash
openssl rand -hex 32
```

## 2. Install the gateway (nothing changes for students yet)

In cPanel → File Manager:

1. Upload `igraphical-dl-secret.example.php` to the **home folder** (the one
   that contains `public_html`, not inside it), rename it to
   `igraphical-dl-secret.php` and put the secret in it.
2. Upload `public_html/v.php` into `public_html`.
3. Test: `https://dl.igraphical.ir/v.php` must answer `bad request`
   (not `not configured`, and not a PHP error).

## 3. Turn on signing in the app

1. Add `DL_SIGNING_SECRET=<same secret>` to
   `/root/envs/igraphical/app.env.local`.
2. Recreate the app container:
   `cd /root/deploy/igraphical && docker compose up -d --force-recreate app`
3. Open a classroom as a student and play a lesson. In DevTools → Network the
   video request must now be `v.php?...` and answer `206`. Seeking must work.

## 4. Block direct access

1. Upload `public_html/Courses/.htaccess` into `public_html/Courses/`.
2. Test:
   - an old direct link such as `https://dl.igraphical.ir/Courses/<course>/<file>.mp4`
     → `403 Forbidden`
   - a course teaser `…/Courses/<course>/tizer.mp4` → still plays
   - a lesson in the classroom → still plays
   - a copied `v.php` link after 3 hours → `link expired`

If a teaser is named differently, add its name to the `FilesMatch` line in
`Courses/.htaccess`.

## Rollback

Delete `public_html/Courses/.htaccess` and old direct links work again.
Removing `DL_SIGNING_SECRET` from the app makes it hand out plain links.

## Notes

- Files are streamed by PHP. If many students watch at once and the host
  hits its PHP process limit, ask the host whether LiteSpeed's
  `X-LiteSpeed-Location` (or Apache `X-Sendfile`) is available; `v.php` can
  then hand the transfer back to the web server.
- Downloadable lesson files (zip, pdf, psd…) go through the same gateway
  and download as attachments.
