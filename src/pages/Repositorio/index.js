import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa'
import api from "../../services/api";
import { Container, Loading, Owner, BackButton, IssuesList, PageActions, FilterList } from "./styles";

export default function Repositorio() {
    const { repositorio: paramsRepositorio } = useParams();
    const [repositorio, setRepositorio] = useState({});
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState([
        {state: 'all', label: 'Todas', active: true},
        {state: 'open', label: 'Abertas', active: false},
        {state: 'closed', label: 'Fechadas', active: false},
    ]);
    const [filterIndex, setFilterIndex] = useState(0);

    useEffect(() => {
        async function load() {
            const nameRepo = decodeURIComponent(paramsRepositorio);

            try {
                const [repositorioData, issuesData] = await Promise.all([
                    api.get(`/repos/${nameRepo}`),
                    api.get(`/repos/${nameRepo}/issues`, {
                        params: {
                            state: filters.find(f => f.active).state, 
                            per_page: 5
                        }
                    })
                ]);

                setRepositorio(repositorioData.data);
                setIssues(issuesData.data);
                console.log(issuesData.data)
            } catch (error) {
                console.error("Erro ao carregar os dados do repositório", error);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [filters, paramsRepositorio]);

    useEffect(()=> {
        async function loadIssue(){
            const nameRepo = decodeURIComponent(paramsRepositorio);

            const response = await api.get(`/repos/${nameRepo}/issues`, {
                params:{
                    state: filters[filterIndex].state,
                    page,
                    per_page: 5, 
                },
            });

            setIssues(response.data)
        }


        loadIssue()
    }, [filterIndex, filters, paramsRepositorio, page]);

    function handlePage(action){
        setPage(action === 'back' ? page - 1 : page + 1 )
    }

    function handleFilter(index){
        setFilterIndex(index);
    }

    if (loading) {
        return (
            <Loading>
                <h1>Carregando...</h1>
            </Loading>
        );
    }

    return (
        <Container>
            <BackButton to="/">
                <FaArrowLeft color="#0d2636" size={30}/>
            </BackButton>

            <Owner>
                <img 
                    src={repositorio.owner.avatar_url} 
                    alt={repositorio.owner.login} 
                />
                <h1>{repositorio.name}</h1>
                <p>{repositorio.description}</p>
            </Owner>

            <FilterList active={filterIndex}>
               {filters.map((filter, index) => (
                <button
                    type="button"
                    key={filter.label}
                    onClick={()=> handleFilter(index)}
                >
                    {filter.label}
                </button>
               ) )}
            </FilterList>

            <IssuesList>
                {issues.map(issue => (
                    <li key={String(issue.id)}>
                        <img src={issue.user.avatar_url} alt={issue.user.login}/>
                        
                        <div>
                            <strong>
                              <a href={issue.html_url}>{issue.title}</a>  

                                {issue.labels.map(label => (
                                    <span key={String(label.id)}>{label.name}</span>
                                ))}
                            </strong>
                            <p>{issue.user.login}</p>
                        </div>
                    </li>
                ))}
            </IssuesList>

            <PageActions>
                <button 
                type="button" 
                onClick={()=> handlePage('back') }
                disabled={page < 2}
                >
                    Voltar
                </button>
                <button type="button" onClick={()=> handlePage('next') }>
                    Proxima
                </button>
            </PageActions>
        </Container>
    );
}
