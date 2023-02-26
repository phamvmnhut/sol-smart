
Các đơn vị tính trong blockchain Ethereum bao gồm:
- `Wei`: Đơn vị nhỏ nhất của Ethereum, tương đương với 10^-18 ETH.
- `Gwei` (hay `Shannon`): Tương đương với 10^9 Wei hoặc 10^-9 ETH.
- `Finney`: Tương đương với 10^15 Wei hoặc 10^-3 ETH.
- `Szabo`: Tương đương với 10^12 Wei hoặc 10^-6 ETH.
- `Ether`: Đơn vị lớn nhất của Ethereum, tương đương với 10^18 Wei.

Không cần sử dụng Safe Math nữa, vì trong bản solidity 0.8.0 trở lên đã cập nhật việc panic này rồi:
- https://viblo.asia/p/troi-troi-biet-gi-chua-solidity-80-vua-release-day-3P0lP02Glox
- `0x01` : Khi gọi hàm assert với argument đánh giá là false
- `0x11` : Nếu như một phép toán số học tạo ra kết quả underflow hoặc overflow của unchecked block .
- `0x12` : Khi chia cho 0 ( e.g. 5 / 0 hay 23 % 0 )
- `0x21` : khi convert gía trị quá lớn hoặc âm thành enum type
- `0x31` : Khi chúng ta gọi .pop() từ một array rỗng
- `0x32` : khi truy cập giá trị của mảng mà index nằm ngoài giới hạn của mảng hoặc âm ( tức là x[i] vs i > x.lenth hoặc i <0
- `0x41` : Nếu bạn phân bổ quá nhiều bộ nhớ hoặc tạo một mảng quá lớn.
- `0x51` : Nếu bạn gọi một biến không được khởi tạo

https://viblo.asia/p/lam-the-nao-de-upgrade-mot-smart-contract-tren-ethereum-phan-2-phan-cuoi-vyDZOqJG5wj

