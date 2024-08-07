interface Props {
  date: string;
}

export default function Footer(props: Props) {
  return (
    <>
      <div class="mt-10 flex flex-col gap-2">
        <br />
      </div>
      <p class="self-end">작성일자 {props.date}</p>
      <br />
      <table class="border-separate self-start">
        <tbody>
          <tr>
            <th class="bg-orange-5 px-4 text-white font-bold">일반 문의</th>
            <td class="px-4">cs@portone.io</td>
          </tr>
          <tr>
            <th class="bg-orange-5 px-4 text-white font-bold">기술지원 문의</th>
            <td class="px-4">support@portone.io</td>
          </tr>
        </tbody>
      </table>
      <p>
        <a class="text-orange-5" href="https://portone.io/korea/ko/service">
          포트원 서비스 더 알아보기 →
        </a>
      </p>
    </>
  );
}
