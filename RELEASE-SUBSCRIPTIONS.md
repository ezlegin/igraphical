# Subscriptions release checklist

Pushing to `main` deploys automatically: GitHub builds the images, and each
container runs `prisma migrate deploy` on start. The backup step in
`apps/app/entrypoint.sh` is commented out, so **back up by hand first**.

Access rules are behind `SUBSCRIPTIONS_ENABLED`: until it is `true`, owners
keep their courses as before. The course cart is gone, though, so **nothing
can be bought while the flag is off** — do steps 2–5 on the same day.

## 1. Before pushing

- [ ] Back up production MySQL on the server and copy the file off the server:
      `docker exec database mysqldump -uroot igraphical > /root/backups/igraphical_$(date +%F_%H%M).sql`
- [ ] Check the dump is not empty (`ls -lh /root/backups`).
- [ ] Optional but recommended: restore the dump into a local MySQL, run
      `npm run db:migrate:deploy -w @igraph/database`, then the backfill dry run
      (step 3) against it, and click through the site with the flag on.

## 2. Push and deploy

- [ ] `git push origin main`, then watch the GitHub Actions run until deploy finishes.
- [ ] On the server, check the migrations ran:
      `docker logs app 2>&1 | grep -i migrat`
- [ ] Remove the old tutor container (no longer in compose):
      `docker rm -f tutor`
- [ ] Site still works with the old behaviour (flag is still off).

## 3. Legacy access backfill

Run inside the app container (or anywhere with the production `DATABASE_URL`).
Pick the launch date you announce; old buyers get 12 months of access and
mentorship on their paid courses from that date.

- [ ] Dry run, check the counts look right:
      `npx tsx packages/database/src/backfill-legacy-access.ts --launch=YYYY-MM-DD`
- [ ] Apply:
      `npx tsx packages/database/src/backfill-legacy-access.ts --launch=YYYY-MM-DD --apply`

## 4. Prices

- [ ] Admin → Subscriptions → Plans & Prices: set price, compare-at price and
      mentorship price for each plan, and switch them visible.
- [ ] Optional: set `SUBSCRIPTION_TUTOR_ID` in `admin.env.local`.

## 5. Switch on

- [ ] Add `SUBSCRIPTIONS_ENABLED=true` to `/root/envs/igraphical/app.env.local`.
- [ ] Recreate the app container so it reads the env:
      `cd /root/deploy/igraphical && docker compose up -d --force-recreate app`
- [ ] Smoke test:
  - a course page shows "buy subscription"; `/plans` lists the plans
  - an old buyer's panel shows "access until …" and the classroom opens
  - a test purchase (cheapest plan) activates the subscription and the
    student can start a course; ask-tutor works only with mentorship
  - admin → Subscriptions lists the purchase

## 6. Signed video links (after launch is stable)

Follow `deploy/dl-host/README.md`: install `v.php`, set `DL_SIGNING_SECRET`,
then block direct access to `/Courses`.

## Rollback

- **Fast:** set `SUBSCRIPTIONS_ENABLED=false` and recreate the app container.
  Old access rules come back immediately (no sales until it is on again).
- **Full:** redeploy the previous image tag (brings the cart back). The migrations only added tables
  and columns, so the old code runs fine against the new schema; no restore
  is needed unless data itself went wrong.

## Known follow-ups

- After deploy, log in to admin as an AUTHOR once and check the blog pages
  still work (posts, comments, images, categories are allowed for AUTHOR;
  everything else now requires ADMIN).
- Campaign / overall-off tables are still in the database (unused); drop them
  later if wanted.
