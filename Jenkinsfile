pipeline {
    agent any

    environment {
        ENV_FILE = credentials('pmng-env')
    }

    stages {
        stage('Construir imagenes') {
            steps {
                sh 'docker build -t backend:v1.0 ./service'
                sh 'docker build -t frontend:v1.0 ./cliente'
            }
        }

        stage('Preparar red y limpiar') {
            steps {
                sh '''
                    docker rm -f pmng-cliente pmng-servicios pmng-persistance || true
                    docker network inspect pmng-net >/dev/null 2>&1 || docker network create pmng-net
                '''
            }
        }

        stage('Desplegar base de datos') {
            steps {
                sh '''
                    docker run -d --name pmng-persistance \
                      --network pmng-net --network-alias pmng-mysql \
                      -p 3306:3306 \
                      --env-file "$ENV_FILE" \
                      -e MYSQL_ROOT_PASSWORD=root \
                      -e MYSQL_DATABASE=people-dev \
                      -v pmng_data:/var/lib/mysql \
                      --restart unless-stopped \
                      mysql:8.0

                    for i in $(seq 1 40); do
                      if docker exec pmng-persistance sh -c 'mysqladmin ping -h 127.0.0.1 -uroot -p"$MYSQL_ROOT_PASSWORD" --silent'; then
                        echo "MySQL listo"
                        exit 0
                      fi
                      echo "Esperando a MySQL ($i)..."
                      sleep 3
                    done
                    echo "MySQL no arranco a tiempo"
                    exit 1
                '''
            }
        }

        stage('Desplegar backend') {
            steps {
                sh '''
                    docker run -d --name pmng-servicios \
                      --network pmng-net --network-alias pmng-back \
                      -p 8089:8080 \
                      --env-file "$ENV_FILE" \
                      --restart unless-stopped \
                      backend:v1.0
                '''
            }
        }

        stage('Desplegar frontend') {
            steps {
                sh '''
                    docker run -d --name pmng-cliente \
                      --network pmng-net \
                      -p 5173:80 \
                      --restart unless-stopped \
                      frontend:v1.0
                '''
            }
        }

        stage('Verificar') {
            steps {
                sh '''
                    docker ps
                    docker network inspect pmng-net
                '''
            }
        }
    }

    post {
        success { echo 'Despliegue de pmng completado' }
        failure { echo 'El despliegue de pmng fallo' }
    }
}
