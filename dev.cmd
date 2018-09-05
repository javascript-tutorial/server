@if "%~1"=="" goto usage

set NODE_LANG=%1
@set NODE_ENV=development
@set ASSET_VERSIONING=query
@set NODE_PRESERVE_SYMLINKS=1
@set NODE_PATH=./modules

call gulp dev | bunyan

goto :eof

:usage
echo Usage: %0 <Language>
exit /B 1
