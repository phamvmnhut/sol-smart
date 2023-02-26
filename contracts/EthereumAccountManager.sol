// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract EthereumAccountManager {
    address payable public teacher;
    address payable public student;
    uint public tuitionAmount;
    uint public totalPaid;

    constructor(
        address payable _teacher,
        address payable _student,
        uint _tuitionAmount
    ) {
        teacher = _teacher;
        student = _student;
        tuitionAmount = _tuitionAmount;
    }

    function payTuition() public payable {
        require(msg.sender == student, "Only the student can pay the tuition.");
        require(msg.value > 0, "The payment amount must be greater than 0.");
        require(
            totalPaid < tuitionAmount,
            "The tuition has already been paid in full."
        );

        uint remainingTuition = tuitionAmount - totalPaid;
        if (msg.value >= remainingTuition) {
            teacher.transfer(remainingTuition);
            if (msg.value > remainingTuition) {
                student.transfer(msg.value - remainingTuition);
            }
            totalPaid = tuitionAmount;
        } else {
            // student.transfer(msg.value);
            totalPaid += msg.value;
        }
    }

    function withdrawFunds() public {
        require(msg.sender == teacher, "Only the teacher can withdraw funds.");
        require(
            totalPaid == tuitionAmount,
            "The tuition has not been paid in full yet."
        );

        uint amount = address(this).balance;
        teacher.transfer(amount);
    }

}
