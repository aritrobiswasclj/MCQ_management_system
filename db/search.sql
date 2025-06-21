select c.category_name

from category c
inner join question q on c.category_id = q.category_id;