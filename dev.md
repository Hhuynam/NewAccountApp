1. Tạo project Express.js ngay trong môi trường Docker khi máy thật chưa có Node.js/npm..
    - Container Node.js  cung cấp sẵn runtime và npm.
```
    cd /usr/src/app
    npm init -y
    npm install express
```
    - Các file package.json và package-lock.json sẽ được sinh ra trong thư mục dự án trên máy thật (nhờ volume mount -v ${PWD}:/usr/src/app).
    Sau đó, Dockerfile mới có thể copy các file này vào image và chạy npm install thành công.

2. Tạo file code backend nodejs express js
    - Cấu trúc thư mục project như sau:
        + folder node_modules/
        + file package.json
        + file package-lock.json
        + file Dockerfile
        + folder src/
            + file src\server.js
        + folder public/
            + file index.html
            + file style.css
            + file script.js

    - Thêm script start vào package.json. 
```
"scripts": {
  "start": "node src/server.js"
}        
 ```

3. Chạy test trong docker
    - Trong container: chạy ```npm start```
    - Mở trình duyệt: ```http://localhost:3000```
    - Nếu thấy dòng "Express JS is working!" → Express đã hoạt động thành công.

4. Chạy lại container