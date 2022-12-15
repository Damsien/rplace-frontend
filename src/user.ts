import http from '@/router/http';
import { useUserStore } from '@/stores/user';
import { HEADERS } from '@/App.vue';

export async function getAndSetUser(url: string) {

    const userSts = useUserStore();

    let res = await http.get(url, {
        headers: HEADERS,
        method: 'GET'
    });

    /*      GROUP       */
    userSts.setGroup(res.data.group);
        

    /*      RANK        */
    userSts.setRank(res.data.rank);


    /*      STICKED PIXELS      */
    userSts.setStickedPixels(res.data.stickedPixels);

    /*      BOMB        */
    userSts.setBombs(res.data.bombs);

    /*      PIXELS PLACED   */
    userSts.setPixelsPlaced(res.data.pixelsPlaced);

    /*      GOLD NAME       */
    userSts.setIsGold(res.data.isGold);


    /*      USER SET        */
    userSts.setPscope(res.data.pscope);
    userSts.setUsername(res.data.username);


    /*      FAVORITE COLOR  */
    userSts.setFavColor(res.data.favColor);

    /*      STEPS       */
    userSts.clearSteps();
    for (let step of res.data.steps) {
        userSts.addStep(step);
    }
    
    return {pscope: res.data.pscope, username: res.data.username};

}