HƯỚNG DẪN NGẮN CHẠY LẦN ĐẦU
===========================

Các bước tối thiểu để chạy project `HRMApi` lần đầu trên Windows (PowerShell)
## Set up

### Backend

1. Tạo môi trường ảo  
   Chỉ tạo lần đầu.

   Di chuyển vào thư mục backend `cd src\BE\HRMApi`và chạy:
   Window: `py -m venv env`
   MacOS: `python3 -m venv env`

2. Kích hoạt môi trường ảo  
   Kích hoạt mỗi lần phát triển backend.
   Window: `.\env\Scripts\activate`
   MacOS: `source env/bin/activate`

3. Cài đặt tất cả các gói trong file `requirements.txt` vào môi trường ảo  
   `pip install -r requirements.txt`  

4. Khi muốn cài đặt một gói mới vào môi trường ảo
   - Cài đặt gói mới  
     `pip install [package]`
   - Cập nhật lại `requirements.txt`  
     `pip freeze > requirements.txt`  


5. Kết thúc làm việc, tắt môi trường ảo:
   `deactivate`

3) Lệnh chạy (thư mục chứa `HRMApi.csproj`)
🔹 Nếu dùng MySQL local
# 1. Xóa database hiện tại
dotnet ef database drop -f

# 2. Xóa thư mục Migrations (trong project)
# (xóa tay bằng File Explorer)

# 3. Tạo migration mới
dotnet ef migrations add InitialCreate

# 4. Tạo lại database
dotnet ef database update

# 5. Chạy backend
dotnet watch run

🔹 Nếu dùng MySQL qua Docker
# 1. Xóa container MySQL
docker rm -f mysql

# 2. (Optional) Xóa volume nếu cần reset dữ liệu
docker volume prune -f

# 3. Tạo migration mới
dotnet ef migrations add InitialCreate

# 4. Tạo lại database
dotnet ef database update

# 5. Chạy backend
dotnet watch run



# Phiên bản DOTNET
1) Cài `dotnet-ef` phù hợp (9.0)
```powershell
dotnet tool uninstall --global dotnet-ef || true
dotnet tool install --global dotnet-ef --version 9.0.0
dotnet-ef --version
```

2) Cập nhật `appsettings.json` (connection string)
```json
"ConnectionStrings": { "DefaultConnection": "Server=localhost;Port=3306;Database=HrmDb;User=root;Password=123456;" }
```

```docker
Tạo server: 
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=HrmDb -p 3306:3306 mysql:8.0

Kiểm tra sau khi chạy: 
docker ps
```
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=mysql;Port=3306;Database=HrmDb;User=root;Password=123456;"
}

```
Cài: dotnet add package RabbitMQ.Client


