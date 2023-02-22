

1. Tạo một contract instance: sử dụng `await ethers.getContractFactory(contractName)` để lấy factory của contract, sau đó dùng `await factory.deploy()` để triển khai contract.

2. Deploy và lấy địa chỉ của smart contract: Sử dụng `.deploy()` để triển khai smart contract và `.address` để lấy địa chỉ của smart contract.

3. Truy cập contract instance: Sử dụng `await contract.methodName()` để gọi các phương thức của smart contract và trả về kết quả.

4. Kiểm tra giá trị trả về của phương thức: Sử dụng `.expect(result).to.equal(expectedValue)` hoặc các phương thức kiểm tra khác trong thư viện Chai để kiểm tra giá trị trả về của phương thức.

5. Kiểm tra sự kiện được emit: Sử dụng `.expect(tx).to.emit(contract, 'EventName').withArgs(args)` để kiểm tra sự kiện được emit.

6. Tương tác với blockchain: Sử dụng `await ethers.provider.getBlockNumber()` để lấy số block hiện tại và `await ethers.provider.getBlock(blockNumber)` để lấy thông tin của một block cụ thể.

7. Tương tác với các tài khoản: Sử dụng `ethers.Wallet.createRandom()` để tạo một tài khoản mới và `await ethers.provider.getBalance(accountAddress)` để lấy số Ether trong tài khoản.

8. Tạo fixture: Sử dụng `beforeEach()` để tạo fixture và cung cấp dữ liệu cho các test case.

9. Điều kiện tiên quyết: Sử dụng `loadFixture()` để đảm bảo các điều kiện tiên quyết cho một hoặc nhiều test case.

10. Thực hiện giao dịch: Sử dụng `await contract.methodName().send({value: amount})` để thực hiện một giao dịch.

11. Tính toán phí gas: Sử dụng `await ethers.provider.getGasPrice()` để lấy giá gas hiện tại và `await contract.methodName.estimateGas()` để ước tính phí gas cho một giao dịch.

12. Thực hiện tương tác với các tài khoản khác nhau: Sử dụng `ethers.provider.getSigner()` để lấy một signer, sau đó sử dụng `.connect(signer)` để tương tác với smart contract với quyền hạn của signer đó.

13. Sử dụng `revert()` để kiểm tra một trường hợp giao dịch không thành công.

14. Sử dụng `expect(await promise).to.be.revertedWith("expected error message")` để kiểm tra thông báo lỗi trả về từ một giao dịch không thành công.

15. Sử dụng `await ethers.provider.getTransactionReceipt(txHash)` để lấy thông tin chi tiết về một giao dịch đã được xác nhận.

16. Sử dụng `await ethers.provider.getTransactionCount(address)` để lấy số lần một địa chỉ đã gửi giao dịch trên mạng.
