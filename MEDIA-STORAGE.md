# Course files on ArvanCloud Object Storage

Lesson videos, downloadable lesson files, free previews and course teasers are
served from the **private** bucket `igraphical-prod` with presigned links that
expire after 3 hours (`apps/app/lib/media-url.ts`).

Lesson URLs in the database are **not changed**: they still say
`https://dl.igraphical.ir/Courses/...`. The app turns that path into the bucket
key `Courses/...` and signs it. So the bucket must contain the same folder
structure as `public_html/Courses` on the cPanel host.

Until the `S3_*` variables are set, the app keeps handing out the old
`dl.igraphical.ir` links, so nothing breaks before the copy is done.

## 1. Copy the files (cPanel → Arvan)

Run this on the Linux server (it has much more bandwidth than a home PC).
Nothing is deleted from cPanel; you can run it again safely, it only copies
what is missing.

1. Install rclone:
   ```bash
   curl https://rclone.org/install.sh | sudo bash
   ```
2. Turn your cPanel FTP password into rclone's format:
   ```bash
   rclone obscure 'YOUR-CPANEL-FTP-PASSWORD'
   ```
3. Create `~/.config/rclone/rclone.conf` with (fill in the `<...>` parts):
   ```ini
   [cpanel]
   type = ftp
   host = dl.igraphical.ir
   user = dligraph
   pass = <output of step 2>
   explicit_tls = true

   [arvan]
   type = s3
   provider = Other
   endpoint = https://<S3_ENDPOINT from app.env.local>
   access_key_id = <S3_ACCESS_KEY_ID>
   secret_access_key = <S3_SECRET_ACCESS_KEY>
   acl = private
   ```
   If the FTP connection fails with a TLS error, delete the `explicit_tls` line.
4. Check both sides are reachable:
   ```bash
   rclone lsd cpanel:public_html/Courses
   rclone lsd arvan:igraphical-prod
   ```
5. Copy (takes a while for ~44 GB; keep it running in `screen` or `tmux`):
   ```bash
   rclone copy cpanel:public_html/Courses arvan:igraphical-prod/Courses --progress --transfers 4 --size-only
   ```
6. Verify nothing is missing:
   ```bash
   rclone check cpanel:public_html/Courses arvan:igraphical-prod/Courses --size-only --one-way
   ```
   It must end with `0 differences found`.

## 2. Switch the website to Arvan

1. Add the same five lines you have locally to
   `/root/envs/igraphical/app.env.local`:
   `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.
2. Recreate the app container:
   ```bash
   cd /root/deploy/igraphical && docker compose up -d --force-recreate app
   ```
3. Check, logged in as a student: a lesson plays and seeking works; in
   DevTools → Network the video comes from `arvanstorage` with
   `X-Amz-Expires=10800` in the link. A course page teaser and a free preview
   also play.

## 3. Close the old host

Once everything plays from Arvan for a few days:

1. In cPanel, create `public_html/Courses/.htaccess` containing:
   ```
   Require all denied
   ```
   Old copied `dl.igraphical.ir/Courses/...` links now return 403.
2. Later, when you're confident, delete the files from cPanel to free its
   disk (it is ~90% full). Keep a backup somewhere first if you want one.

## Costs (Arvan "پایه" plan)

No monthly fee; first 5 GB storage and 20 GB traffic free, then 3,000 T per
GB stored per month and 850 T per GB downloaded. At today's usage (~44 GB,
~130 GB/month traffic) that is roughly 210,000 T/month. The "رشد" plan only
becomes cheaper above ~1.9 TB of traffic per month.

## Uploading new courses

Upload new files into the bucket under `Courses/<course>/...` (Arvan panel or
`rclone copy`) and keep using `https://dl.igraphical.ir/Courses/<course>/<file>`
as the lesson URL in admin. The app maps it to the bucket automatically.
