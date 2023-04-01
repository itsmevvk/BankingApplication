public without sharing class BankingAppLWC_Controller {
    public BankingAppLWC_Controller() {

    }
    @AuraEnabled
    public static wrapperCls handleLoginMethod(String username, String password){
        try {
            wrapperCls wrp = new wrapperCls();
            List<Bank_User__c> bankUserLst = [SELECT Id, Name, Full_Name__c, Email__c, Account_Balance__c, Account_Number__c FROM Bank_User__c WHERE Email__c =: username AND password__c =: password];
            System.debug('bankUserLst-->'+bankUserLst);
            if(bankUserLst.size() > 0){
                wrp.transList = getTransactions(bankUserLst[0].Id);
                wrp.LoggedInUser = bankUserLst[0];
                return wrp;
            } 

            throw new CalloutException();

            //return null;
        } catch (Exception e) {
            system.debug('e.getMessagelogin+   '+e.getMessage());
            throw new AuraHandledException('Invalid Username or Password.');

            //return null;
        }
    }
    @AuraEnabled
    public static String doChangePassword(String password, String userId){
        try {
            if(!String.isBlank(userId)){
                Bank_User__c bnkUser = [SELECT Id, Name, Password__c FROM Bank_User__c WHERE Id =:userId LIMIT 1];
                bnkUser.Password__c = password;
                update bnkUser;
            }
            Return 'Password Changed';
        } catch (Exception e) {
            system.debug('e.getMessagelogin+   '+e.getMessage());
            throw new AuraHandledException('Invalid Username or Password.');

            //return null;
        }
    }
    @AuraEnabled
    public static String handleTransferMethod(String accountNumber, Integer amount, String userId){
        try {
            String returnString = '';
            system.debug('accountNumber'+accountNumber);
            system.debug('amount'+amount);
            system.debug('userId'+userId);
            List<Bank_User__c> bnkUsrLst = new List<Bank_User__c>();
            if(!string.isBlank(accountNumber) && amount != NULL){
                bnkUsrLst = [SELECT Id, Name, Account_Balance__c FROM Bank_User__c WHERE Account_Number__c	 =: accountNumber LIMIT 1];
                if(bnkUsrLst.isEmpty()){
                    returnString = 'No Account Found/Invalid Account';
                }else{
                    List<Transaction__c> transList = new List<Transaction__c>();
                    Transaction__c transObj = new Transaction__c();
                    transObj.Bank_User__c = bnkUsrLst[0].Id;
                    transObj.Amount__c = amount;
                    transObj.Type__c = 'Deposit';
                    Transaction__c transObj2 = new Transaction__c();
                    transObj2.Bank_User__c = userId;
                    transObj2.Amount__c = amount;
                    transObj2.Type__c = 'Withdraw';
                    transList.add(transObj);
                    transList.add(transObj2);
                    insert transList;
                    if(bnkUsrLst[0].Account_Balance__c != Null){
                        bnkUsrLst[0].Account_Balance__c = bnkUsrLst[0].Account_Balance__c + amount;
                    }else{
                        bnkUsrLst[0].Account_Balance__c = amount;
                    }
                    update bnkUsrLst;
                    Bank_User__c loggedInUser = [SELECT Id, Account_Balance__c FROM Bank_User__c WHERE Id =: userId LIMIT 1];
                    if(loggedInUser != NULL){
                        loggedInUser.Account_Balance__c = loggedInUser.Account_Balance__c - amount;
                        update loggedInUser;
                    }
                    returnString = 'Amount Transfered Successfully';
                }
            }
            return returnString;
        } catch (Exception e) {
            system.debug('e.getMessagelogin+   '+e.getMessage());
            throw new AuraHandledException('Unknown Error.');

            //return null;
        }
    }
    @AuraEnabled
    public static wrapperCls handleRegisterMethod(String firstName, String lastName, String email, String password){
        try {
            wrapperCls wrp = new wrapperCls();
            Bank_User__c usrObj = new Bank_User__c();
            usrObj.Name = lastName;
            usrObj.First_Name__c = firstName;
            usrObj.Email__c = email;
            usrObj.password__c = password;
            usrObj.Account_Balance__c = 0;
            insert usrObj;
            if(usrObj.Id != null){
                Bank_User__c usrObjQueried = [SELECT Id, Name, Full_Name__c, Email__c, Account_Balance__c,  Account_Number__c FROM Bank_User__c WHERE Id =: usrObj.Id];
                wrp.transList = getTransactions(usrObj.Id);
                wrp.LoggedInUser = usrObjQueried;
                return wrp;
            } 

            throw new CalloutException();

            //return null;
        } catch (Exception e) {
            system.debug('e.getMessagelogin+   '+e.getMessage());
            throw new AuraHandledException('Unknown Error.');

            //return null;
        }
    }
    @AuraEnabled
    public static List<Transaction__c> getTransactions(String userId){
        List<Transaction__c> transactionLst = new List<Transaction__c>();
        if(!String.isBlank(userId)){
            transactionLst = [SELECT Id, Name, Amount__c, Type__c, CreatedDate, Bank_User__c FROM Transaction__c WHERE Bank_User__c =: userId];
            return transactionLst;
        }
        return null;
    }
    @AuraEnabled(Cacheable=false)
    public static Integer doWithdrawMethod(Integer amount, String userId){
        system.debug('amount--->'+amount);
        List<Transaction__c> transactionLst = new List<Transaction__c>();
        if(!String.isBlank(userId) && amount != NULL){
            Transaction__c trnObj = new Transaction__c();
            trnObj.Bank_User__c = userId;
            trnObj.Amount__c = amount;
            trnObj.Type__c = 'Withdraw';
            transactionLst.add(trnObj);
            //return true;
        }
        Bank_User__c usrObjQueried = [SELECT Id, Name, Full_Name__c, Email__c, Account_Balance__c,  Account_Number__c FROM Bank_User__c WHERE Id =: userId];
        usrObjQueried.Account_Balance__c = usrObjQueried.Account_Balance__c - amount;
        update usrObjQueried;
        return Integer.valueOf(usrObjQueried.Account_Balance__c);
    }
    public class wrapperCls{
        @AuraEnabled
        public List<Transaction__c> transList{get;set;}
        @AuraEnabled
        public Bank_User__c LoggedInUser{get;set;}
    }
}