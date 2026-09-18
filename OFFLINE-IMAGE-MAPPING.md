# Offline product image mapping

The seed catalog now points products to local image assets under `frontend/public/images/products/` instead of external image hosts. Product-specific mismatches were corrected for saffron, spice items, herbal distillates, oils, nuts, honey, rosewater, chamomile, hibiscus tea, and herb blends.

The image set is intentionally self-contained for offline rendering. Re-run the backend seed command to apply the new image URLs to an existing database.
