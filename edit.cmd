@if "%~1"=="" goto usage

@if "%~2"=="" (
    set NODE_LANG=en
) else (
    set NODE_LANG=%2
)

@set TUTORIAL_LANG=%1
@set NODE_ENV=production
@set TUTORIAL_EDIT=1
@set ASSET_VERSIONING=query
@set NODE_PRESERVE_SYMLINKS=1
@set NODE_PATH=./modules

call gulp edit | bunyan

goto :eof

:usage
@echo "Usage: %0 <tutorial language> [<server language>]"
@exit /B 1
