pipeline {
    agent any
    stages {
        stage('Checkout SCM'){
            steps {
                git branch: 'development', credentialsId: 'Apollo-Git', url: 'https://github.com/popcornapps/apollo-hospitals.git' 
            }
            
        }
        stage('Install') {
            steps {
                sh "npm install"
    
            }
        }
        stage('run bootstrap') {
            steps {
                sh "npm run bootstrap"
    
            }
        }
        stage("lint check") {
            steps {
                sh "npm run lint"
            }
            
        }
        
         stage("Syntax Check") {
            steps {
                sh "npm run format"
            }
            
        }
    }
    post { 
        always { 
            echo 'I will always say Hello again'
        }
    }
}
