# Product edit fix

Fixed product editing in two places:

- Existing local product images under `/images/...` are now accepted by the update validator. Previously, saving any seeded product could fail with an invalid image URL error.
- Admins can now load inactive products in the edit form. Customers still only receive active products.

Regression checks pass, including the full responsive audit.
