# fidhacks_project


## Run on MacOS

```zsh
cd backend

rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate

which python
which pip

python -m pip install --upgrade pip
python -m pip install fastapi uvicorn

python -m uvicorn main:app --reload
```

