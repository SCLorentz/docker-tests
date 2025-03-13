printf "$(cat /root/start.txt)\n\n"

PS1='\[\e[3m\](\d)\[\e[0m\] \[\e[92m\]\w\[\e[0m\] \\$ '

refresh()
{
    printf "\x1B[2J\x1B[H\x1B[?25l"

    cp /workspaces/docker-tests/becca/.devcontainer/cmd/start.txt /root/start.txt
    cp /workspaces/docker-tests/becca/.devcontainer/cmd/.bash /root/.bashrc

    source /root/.bashrc

    IFS= read -r -n1 -s key
    printf "\x1b[38;5;245m\x1b[3mnow you entered in the terminal, good luck!\x1b[0m\n\x1B[?25h"
}

help()
{
    if [[ "$1" == "git" ]]; then
        printf "use git push to synchronize your project with the web\nuse git pull to get the last version of your project\nuse git checkout to go back and forward to different versions of your program\n"
    elif [[ "$1" == "deno" ]]; then
        printf "use deno run /path/to/your/file.ts to run your JS/TS program\n"
    else
        printf "Usage: help <command>\nAvailable commands: git, deno\n"
    fi
    printf "\n"
}