FROM python:3.8.11-buster

## Python ##
# Stop creation of compiled code
ENV PYTHONDONTWRITEBYTECODE 1
# Prevents buffering stderr / stdout
ENV PYTHONUNBUFFERED 1

RUN mkdir -p /Backend/Django/
WORKDIR /Backend/Django/

## Dependencies ##
RUN apt-get -y update \
    && apt-get -y upgrade \
    && apt-get -y install gcc python3-dev musl-dev \
    # Python: psycopg2 
    && apt-get -y install postgresql \
    # Python: Pillow
    && apt-get -y install libpng-dev zlib1g-dev libjpeg-dev \
    # Git
    && apt-get -y install git 

## Python & pipenv ##
ADD ./Backend/Django/Pipfile ./Backend/Django/Pipfile.lock /Backend/Django/
RUN pip install --upgrade pip
RUN pip install pipenv
RUN pipenv install --system --deploy --ignore-pipfile

# Backend Volume
COPY ./Backend/ /Backend/

# Expose the port 8000
EXPOSE 8000
