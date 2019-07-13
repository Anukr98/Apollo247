pipeline {
    agent any
    stages {
        stage('Checkout SCM'){
            steps {
                git branch: 'development', credentialsId: 'githubcred', url: 'https://github.com/popcornapps/apollo-hospitals.git'    
            }
            
        }
        stage('Shutdown Docker Images') {
            steps{
                sh "/usr/local/bin/docker-compose -f docker-compose.yml down"    
            }
        }
        stage('Install') {
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
                sh "npm run format:check"
            }
            
        }
    }
    post { 
        always { 
            echo 'I will always say Hello again!'
        }
    }
}
