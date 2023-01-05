import sanityClient from '@sanity/client';
import ImageUrlBuilder from '@sanity/image-url';

export const client = sanityClient({
    projectId: '6isekkxz',
    dataset:'production',
    apiVersion:'2022-02-01',
    token: 'skhAOniMTcwbPHOuJK6d8xe64rAbqjFqKgAU5N5y6jA5XucJJsADQ1AT4HlomoLT3UmJCWhn0MOf4SD34dVSgfitGYKoMDd2TgsYxucd2EXqK0WyWNpMK1VEBh0onbuPAr9ouroHLbKivW06FdpuK68OGTjZGsL5S0BpDOs0hjvuZtCILHWP',
    useCdn:false,
})

const builder = ImageUrlBuilder(client);
export const urlFor = (source) => builder.image(source);