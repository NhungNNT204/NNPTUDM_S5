```markdown
Nguyễn Thị Thùy Nhung _ 2280602246

Run and test instructions

1) Install dependencies (from `Sep11_2` folder):

```powershell
npm install
```

2) Start json-server (in one terminal):

```powershell
npm run start
```

3) Run integration test (node, cross-platform) in another terminal:

```powershell
npm run test:int
```

This test will:
- create a post
- soft-delete it (set `isDelete: true`)
- restore it (set `isDelete: false`)

There is also an existing Windows PowerShell test script at `scripts/integration_test.ps1`.

Notes:
- `db.json` ids are normalized to numbers and the client lets `json-server` auto-assign ids on POST.
- If you prefer client-side id assignment (not recommended for multi-client), let me know and I can revert.

```
Nguyễn Thị Thùy Nhung _ 2280602246
