import { LightningElement, track } from 'lwc';
import doLogin from '@salesforce/apex/BankingAppLWC_Controller.handleLoginMethod';
import doRegister from '@salesforce/apex/BankingAppLWC_Controller.handleRegisterMethod';
import doTransfer from '@salesforce/apex/BankingAppLWC_Controller.handleTransferMethod';
import doWithdrawMethod from '@salesforce/apex/BankingAppLWC_Controller.doWithdrawMethod';
import doChangePassword from '@salesforce/apex/BankingAppLWC_Controller.doChangePassword';
import getTransactions from '@salesforce/apex/BankingAppLWC_Controller.getTransactions';

import BackgroundImg from '@salesforce/resourceUrl/BankBg';
export default class BankingApp_LWC extends LightningElement {
    username;
    password;
    firstName;
    lastName;
    email;
    amount;
    accountNumber;
    regPassword;
    regConfirmPassword;
    changePassword;
    changeNewPassword;
    changeConfirmPassword;
    imageUrl = BackgroundImg;
    
    @track transactions = [];
    @track data = [];
    @track loggedInUser;
    @track errorCheck;
    @track errorMessage;
    @track isShowModal = false;
    @track isShowWithdrawModal = false;
    @track isShowTransferModal = false;
    @track isShowPasswordModal = false;
    @track isHomePage = true;
    @track isMenuPage = true;
    @track isInfoPage = false;
    @track isbackBtn = false;
    @track isShowEstatement = false;


    connectedCallback(){
        var meta = document.createElement("meta");
        meta.setAttribute("name", "viewport");
        meta.setAttribute("content", "width=device-width, initial-scale=1.0");
        document.getElementsByTagName('head')[0].appendChild(meta);
    }
    get getBackgroundImage(){
        return `background-image:url("${this.imageUrl}")`;
    }
    handleUserNameChange(event){
        this.errorCheck = false;
        this.username = event.target.value;
    }
    handleFNameChange(event){
        this.errorCheck = false;
        this.firstName = event.target.value;
    }
    handleLNameChange(event){
        this.errorCheck = false;
        this.lastName = event.target.value;
    }
    handleEmailChange(event){
        this.errorCheck = false;
        this.email = event.target.value;
    }
    handleRegPasswordChange(event){
        this.errorCheck = false;
        this.regPassword = event.target.value;
    }
    handleRegConfirmPasswordChange(event){
        this.errorCheck = false;
        this.regConfirmPassword = event.target.value;
    }
    handlePasswordChange(event){
        this.errorCheck = false;
        this.password = event.target.value;
    }
    showModalBox() {  
        this.errorCheck = false;
        this.isShowModal = true;
    }   
    hideModalBox() {  
        this.errorCheck = false;
        this.isShowModal = false;
    }
    hideWithdrawModal(){
        this.isMenuPage = true;
        this.isShowWithdrawModal = false;
    }
    handleLogout(){
        location.reload();
    }
    handleInfo(){
        this.isMenuPage = false;
        this.isInfoPage = true;
        this.isbackBtn = true;
    }
    handleBack(){
        this.isMenuPage = true;
        this.isInfoPage = false;
        this.isbackBtn = false;
        this.isShowEstatement = false;
    }
    handleWithdrawPopup(){
        this.isMenuPage = false;
        this.isShowWithdrawModal =true;
    }
    handleTransferPopup(){
        this.isMenuPage = false;
        this.isShowTransferModal = true;
    }
    handlePasswordPopup(){
        this.isMenuPage = false;
        this.isShowPasswordModal = true;
    }
    handleAmountChange(event){
        this.errorCheck = false;
        this.amount = event.target.value;
    }
    handleAccountNumberChange(event){
        this.errorCheck = false;
        this.accountNumber = event.target.value;
    }
    hideWModalBox(event){
        this.isMenuPage = true;
        this.isShowWithdrawModal =false;
        this.isShowTransferModal = false;
        this.isShowPasswordModal = false;
    }
    handleCPasswordChange(event){
        this.errorCheck = false;
        this.changePassword = event.target.value;
    }
    handleNPasswordChange(event){
        this.errorCheck = false;
        this.changeNewPassword = event.target.value;
    }
    handleNConfirmPasswordChange(event){
        this.errorCheck = false;
        this.changeConfirmPassword = event.target.value;
    }
    filterType = {
        'AccountId':['001....']
    };
    handleWithdraw(event){
        //if(this.password === this.loggedInUser.password__c){
            if(this.amount && this.password){
                event.preventDefault();
                doWithdrawMethod({ amount: this.amount, userId: this.loggedInUser.Id })
                .then((result) => {
                    this.isHomePage= false;
                    this.isUserPage= true;
                    this.isMenuPage = true;
                    this.isShowWithdrawModal =false;
                    //this.loggedInUser = result;
                })
                .catch((error) => {
                    console.log('error-->'+error);
                    alert('Catch');
                    console.log('error-->'+error);
                    this.error = error;      
                    this.errorCheck = true;
                    this.errorMessage = error.body.message;
                    console.log('error.body.message-->'+error.body.message);
                });
    
            }
        //}
    }
    handleW(event){
        alert("ok");
    }
    handleLogin(event){
        if(this.username && this.password){
            event.preventDefault();
            doLogin({ username: this.username, password: this.password })
            .then((result) => {
                this.isHomePage= false;
                this.isUserPage= true;
                this.transactions = result;
                this.loggedInUser = result.LoggedInUser;
                console.log('loggedIn User-->'+result.LoggedInUser);
            })
            .catch((error) => {
                this.error = error;      
                this.errorCheck = true;
                this.errorMessage = error.body.message;
            });

        }
    }
    
    handleTransferMethod(event){
        //if(this.email && this.regConfirmPassword && this.regPassword){
            console.log('this.accountNumber'+this.accountNumber);
            console.log('this.amount'+this.amount);
            event.preventDefault();
            doTransfer({ accountNumber: this.accountNumber, amount: this.amount, userId: this.loggedInUser.Id })
                    .then((result) => {
                        alert('result--->'+result);
                        this.isMenuPage = true;
                        this.isShowTransferModal = false;
                        //this.transactions = result;
                        //this.loggedInUser = result.LoggedInUser;
                    })
                    .catch((error) => {
                        //this.error = error;      
                        //this.errorCheck = true;
                        //this.errorMessage = error.body.message;
                    });
            //}
    }
    handlePasswordMethod(event){
        event.preventDefault();
        if(this.changePassword === this.password){
            if(this.changeNewPassword === this.changeConfirmPassword){
                doChangePassword({ password: this.changeNewPassword, userId: this.loggedInUser.Id })
                .then((result) => {
                    alert('Password Changed Successfully.')
                    this.isShowPasswordModal = false;
                })
                .catch((error) => {
                    this.error = error;      
                    this.errorCheck = true;
                    this.errorMessage = error.body.message;
                });
            }else{
                this.errorCheck = true;
                this.errorMessage = 'New password does not match.';
            }
        }else{
            this.errorCheck = true;
            this.errorMessage = 'Incorrect Password';
        }
    }
    handleStatement(event){
        event.preventDefault();
            getTransactions({userId: this.loggedInUser.Id })
            .then((result) => {
                console.log(result);
                this.data = result;
                this.isShowEstatement = true;
                this.isMenuPage = false;
                this.isInfoPage = false;
                this.isbackBtn = true;
            })
            .catch((error) => {
                this.error = error;      
                this.errorCheck = true;
                this.errorMessage = error.body.message;
            });
    }
    handleRegister(event){
        if(this.firstName && this.lastName && this.email && this.regConfirmPassword && this.regPassword){
            event.preventDefault();
            if(this.regConfirmPassword === this.regPassword){
                doRegister({ firstName: this.firstName, lastName: this.lastName, email: this.email, password: this.regConfirmPassword })
                .then((result) => {
                    this.data = result;
                    this.loggedInUser = result.LoggedInUser;
                })
                .catch((error) => {
                    this.error = error;      
                    this.errorCheck = true;
                    this.errorMessage = error.body.message;
                });
            }else{
                this.errorCheck = true;
                this.errorMessage = 'Password do not match';
            }
        }
    }
}