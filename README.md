# 🔥Calcifer

😈I'm the supreme fire demon knows everything about the attendance report!

Try it out:
https://daily-prophet.github.io/Calcifer/

## Setup backend development environment

1. Put the `.env` & `document.md` file in `backend` folder
2. Make sure your python version >= `3.10`, then execute the following command line:

```shell
cd .\backend
python -m venv devenv
.\devenv\Scripts\activate
pip install --prefer-binary -r dev_requirements.txt
```

3. start jupyter notebook in `backend` folder:

```shell
jupyter-lab
```

4. we can use this command to run the server, if you want to auto reload serivce when develop, add --reload:

```shell
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

5. You can use this curl command to test the backend service:

```shell
curl -X POST -H "Accept: application/json" -H "Content-Type: application/json" -d '{"question": "who are you?"}' http://localhost:8000/ask
```
