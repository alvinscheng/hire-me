-- up
create table interviews (
  id serial,
  application_id integer,
  date timestamp,
  interview_number integer
);

---

-- down
drop table interviews;
