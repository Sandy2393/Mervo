-- Sample queries (adjust table/column names to match migrations)

-- Unreconciled payments in a date range
select p.*
from payments p
left join jobs j on j.id = p.job_instance_id
where p.company_id = :company_id
  and p.created_at between :start and :end
  and p.status = 'succeeded'
  and (j.id is null or j.status != 'approved');

-- Unpaid payouts
select po.*
from payouts po
where po.company_id = :company_id
  and po.status in ('scheduled','failed');

-- Monthly revenue summary
select date_trunc('month', created_at) as month,
       sum(amount_cents) as revenue_cents,
       currency
from payments
where company_id = :company_id
  and status = 'succeeded'
group by 1, currency
order by 1 desc;
