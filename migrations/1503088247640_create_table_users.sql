-- up
create table applications (
  id serial,
  full_name text,
  email text,
  phone text,
  picture text,
  google_id text
);

---

-- down
drop table applications;
