-- up
create table applications (
  id serial,
  job_title text,
  company text,
  location text,
  user_id integer
);

---

-- down
drop table applications;
