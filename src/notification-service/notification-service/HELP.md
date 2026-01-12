# Notification Service (Java – Spring Boot)

Notification Service dùng để:
- Nhận event từ HRM API (.NET)
- Lưu notification vào database
- Cung cấp API để Frontend hiển thị thông báo in-app (chuông thông báo)

---

## 1. Yêu cầu môi trường

Trước khi chạy, máy cần cài:

### Java
- Java 17
- Kiểm tra:
```
java -version
```

### Maven
- Maven 3.8+
- Kiểm tra:
```
mvn -version
```

### Database
- MySQL 8.x
- Đảm bảo MySQL đang chạy

---

## 2. Clone project từ Git

```
git clone <GIT_REPOSITORY_URL>
```

Di chuyển vào thư mục chứa `pom.xml` của notification service:

```
cd notification-service
```

⚠️ Lưu ý: phải đứng **đúng thư mục có file `pom.xml`** thì mới build/run được.

---

## 3. Cấu hình database & port

Mở file cấu hình:

```
src/main/resources/application.properties
```
hoặc
```
src/main/resources/application.yml
```

Cập nhật các thông tin sau:

```
server.port=8085

spring.datasource.url=jdbc:mysql://localhost:3306/hrm_notifications?createDatabaseIfNotExist=true
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration

notification.internalApiKey=CHANGE_ME
```

---

## 4. Database migration (Flyway)

- Flyway sẽ **tự động chạy khi application start**
- Không cần chạy SQL thủ công
- Các file migration nằm tại:

```
src/main/resources/db/migration
```

Ví dụ:
```
V1__init.sql
```

---

## 5. Build project

Chạy lệnh sau tại thư mục chứa `pom.xml`:

```
mvn clean package -DskipTests
```

Sau khi build thành công sẽ tạo file:

```
target/notification-service-0.0.1-SNAPSHOT.jar
```

---

## 6. Chạy application

```
java -jar target/notification-service-0.0.1-SNAPSHOT.jar
```

Nếu chạy thành công, console sẽ xuất hiện log dạng:

```
Tomcat started on port(s): 8085
```

---

## 7. Kiểm tra service hoạt động

Mở trình duyệt hoặc Postman:

```
GET http://localhost:8085/api/v1/users/1/notifications
```

Nếu trả về JSON (kể cả mảng rỗng `[]`) thì service đã chạy thành công.

---

## 8. API chính

### Nhận event từ HRM API (.NET)

```
POST http://localhost:8085/api/v1/notifications/events
```

Header:
```
X-Internal-Key: <notification.internalApiKey>
```

### Lấy danh sách notification theo user

```
GET http://localhost:8085/api/v1/users/{userId}/notifications
```

### Lấy số notification chưa đọc

```
GET http://localhost:8085/api/v1/users/{userId}/notifications/unread-count
```

### Đánh dấu notification đã đọc

```
PATCH http://localhost:8085/api/v1/users/{userId}/notifications/{id}/read
```

---

## 9. Tích hợp với HRM API (.NET)

HRM API cần gọi endpoint `/notifications/events` khi:
- Tạo request
- Approve request
- Reject request

Notification Service sẽ lưu dữ liệu và cung cấp lại cho Frontend.

---

## 10. CORS (Frontend)

Frontend chạy tại:
```
http://localhost:3000
```

Notification Service đã cấu hình CORS để Frontend gọi API được.

---

## 11. Troubleshooting

### Không chạy được `java -jar`
- Kiểm tra Java version (phải là Java 17)

### Không kết nối được MySQL
- Kiểm tra username/password
- Kiểm tra MySQL service đang chạy

### Flyway không chạy
- Kiểm tra thư mục `db/migration`
- Đảm bảo tên file đúng format `V1__*.sql`

---

## 12. Port sử dụng

| Service                | Port |
|------------------------|------|
| Notification Service   | 8085 |
| HRM API (.NET)         | 8080 |
| Frontend (React)       | 3000 |

---

## 13. Ghi chú

- Notification Service chạy **độc lập**
- Có thể chạy riêng để test
- Dùng cho đồ án môn **Phát triển Hệ thống Thông tin Hiện đại**
