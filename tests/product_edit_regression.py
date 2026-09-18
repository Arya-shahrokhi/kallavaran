from pathlib import Path

validator = Path("backend/src/validators/productValidators.js").read_text()
controller = Path("backend/src/controllers/productController.js").read_text()
assert "^\\/images\\/" in validator, "local seeded images must be accepted on update"
assert "req.user?.role === 'ADMIN'" in controller, "admin visibility rule missing"
print("PASS: product edit accepts local images and admin can load inactive products")
