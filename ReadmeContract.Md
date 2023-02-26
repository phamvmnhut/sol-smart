
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

Tối ưu hoá phí `Gas`
- Sử dụng modifier thay vì viết lại các chức năng
Modifier là một phần của Solidity cho phép bạn viết một lần và sử dụng lại trong nhiều chức năng khác nhau. Thay vì viết lại các chức năng, bạn có thể sử dụng modifier để thực hiện kiểm tra tính hợp lệ của các giá trị đầu vào. Việc sử dụng modifier giúp tránh việc lặp lại mã và giảm chi phí gas.

- Sử dụng mapping thay vì arrays
Các arrays trong Solidity có thể gây ra chi phí gas đáng kể nếu bạn thực hiện các hoạt động như tìm kiếm, sắp xếp hoặc lặp qua chúng. Sử dụng mapping có thể giảm thiểu chi phí gas vì nó cung cấp một cách nhanh chóng để truy xuất các giá trị.

- Tránh sử dụng vòng lặp trong hàm
Việc sử dụng vòng lặp trong hàm có thể gây ra chi phí gas lớn. Tránh sử dụng vòng lặp trong hàm để giảm thiểu chi phí gas. Nếu bạn phải sử dụng vòng lặp, hãy sử dụng vòng lặp "for" vì nó hiệu quả hơn vòng lặp "while" trong một số trường hợp.

- Sử dụng kiểu dữ liệu thích hợp
Sử dụng kiểu dữ liệu thích hợp có thể giảm thiểu chi phí gas. Ví dụ, sử dụng kiểu uint8 thay vì uint256 khi bạn chỉ cần lưu trữ các giá trị nhỏ.

- Sử dụng các hàm xem (view) và pure để đọc dữ liệu

- Sử dụng kiểm tra thay vì ném ngoại lệ: Ném ngoại lệ (throw hoặc revert) là một trong những phương thức để kiểm tra các điều kiện trong hợp đồng. Tuy nhiên, sử dụng kiểm tra bằng if hoặc require sẽ tiết kiệm được gas hơn.

- Sử dụng memory thay vì storage: Sử dụng bộ nhớ memory để lưu trữ các biến tạm thời sẽ giúp giảm thiểu gas sử dụng hơn so với sử dụng bộ nhớ storage.

- Gộp các giao dịch lại với nhau: Nếu có thể, gộp các giao dịch lại với nhau sẽ giúp giảm thiểu gas sử dụng hơn.

- Sử dụng thư viện ngoài: Sử dụng các thư viện ngoài sẽ giúp giảm thiểu việc lặp lại code và giúp cho hợp đồng của bạn trở nên nhỏ gọn hơn, do đó tiết kiệm được gas sử dụng.
