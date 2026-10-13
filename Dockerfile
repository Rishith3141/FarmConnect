FROM maven:3.9-eclipse-temurin-25 AS build

WORKDIR /app

COPY backend/pom.xml pom.xml
COPY backend/src src

RUN mvn -B -DskipTests package

FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 10000

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-10000} -jar app.jar"]