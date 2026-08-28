# RBAC Matrix

Dokumen ini adalah acuan resmi role dan permission untuk aplikasi admin.

## Roles Default

1. SUPER ADMIN
2. ADMIN
3. EDITOR

## Permission Catalog

1. all
2. role.manage
3. user.read
4. user.create
5. user.update
6. user.delete
7. company.manage
8. article.create
9. article.update
10. article.delete
11. portfolio.create
12. portfolio.update
13. portfolio.delete
14. experience.create
15. experience.update
16. experience.delete
17. education.manage
18. language.manage
19. skill.manage
20. certification.manage
21. frontend_settings.manage

## Matrix Per Role

| Permission | SUPER ADMIN | ADMIN | EDITOR |
| --- | --- | --- | --- |
| all | Yes | No | No |
| role.manage | Yes | No | No |
| user.read | Yes | Yes | No |
| user.create | Yes | Yes | No |
| user.update | Yes | Yes | No |
| user.delete | Yes | Yes | No |
| company.manage | Yes | Yes | No |
| article.create | Yes | Yes | Yes |
| article.update | Yes | Yes | Yes |
| article.delete | Yes | Yes | No |
| portfolio.create | Yes | Yes | Yes |
| portfolio.update | Yes | Yes | Yes |
| portfolio.delete | Yes | Yes | No |
| experience.create | Yes | Yes | Yes |
| experience.update | Yes | Yes | Yes |
| experience.delete | Yes | Yes | No |
| education.manage | Yes | Yes | Yes |
| language.manage | Yes | Yes | Yes |
| skill.manage | Yes | Yes | Yes |
| certification.manage | Yes | Yes | Yes |
| frontend_settings.manage | Yes | Yes | Yes |

## Enforcement Rules

1. Role SUPER ADMIN tidak boleh dihapus.
2. Permission all wajib tetap ada untuk role SUPER ADMIN.
